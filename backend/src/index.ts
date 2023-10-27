import bcrypt from 'bcryptjs';
import env from 'dotenv';
import jwt from 'jsonwebtoken';
import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { prisma } from '../prisma';
import auth from './middleware/auth';

import { createNewMessage, getAllRooms } from './queries';

const PORT = 3000;

env.config();

const app: Express = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  },
  transports: ['websocket']
});

app.use(cors());
app.use(express.json());

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

app.post('/register', async (req: Request, res: Response) => {
  const data: { email: string; username: string; password: string } = req.body;
  const oldUser = await prisma.user.findFirst({ where: { email: data.email } });
  if (oldUser) {
    res.status(400).send('Email already in use');
    return;
  }

  const encryptedPassword = await bcrypt.hash(data.password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        username: String(data.username),
        password: encryptedPassword,
        token: '',
        email: data.email
      }
    });

    const token = jwt.sign(
      { user_id: user.id, email: data.email },
      process.env.TOKEN_KEY as jwt.Secret,
      {
        expiresIn: '2h'
      }
    );

    const userWithToken = await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        token
      },
      select: {
        password: false,
        id: true,
        username: true,
        email: true,
        token: true
      }
    });

    res.status(201).json({ ok: true, userData: { ...userWithToken } });
  } catch (err) {
    console.log(err);
  }
});

app.post('/login', async (req: Request, res: Response) => {
  try {
    const data: { email: string; password: string } = req.body;
    const user = await prisma.user.findFirst({ where: { email: data.email } });

    if (user && (await bcrypt.compare(data.password, user.password))) {
      const token = jwt.sign(
        { user_id: user.id, email: data.email },
        process.env.TOKEN_KEY as jwt.Secret,
        {
          expiresIn: '2h'
        }
      );

      const userData = await prisma.user.update({
        where: { id: user.id },
        data: { token },
        select: {
          id: true,
          username: true,
          token: true,
          email: true
        }
      });

      res.status(200).json({ ok: true, userData: { ...userData } });
    } else {
      res.status(400).send({ ok: false, error: 'Invalid Credentials' });
    }
  } catch (err) {
    console.log(err);
  }
});

app.get('/get-rooms', auth, async (req: Request, res: Response) => {
  const { userId } = req.query;

  try {
    const rooms = await getAllRooms(String(userId));

    res.status(200).json(rooms);
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
});

app.post('/new-room', auth, async (req: Request, res: Response) => {
  try {
    const data: { userID: string; email: string } = req.body;

    const addedUserData = await prisma.user.findFirst({
      where: { email: data.email },
      select: {
        id: true
      }
    });

    if (addedUserData) {
      const timeJoined = new Date().toISOString();
      const newRoom = await prisma.room.create({
        data: {
          roomMembers: {
            create: [
              { userId: data.userID, timeJoined },
              { userId: addedUserData.id, timeJoined }
            ]
          }
        },
        select: {
          roomId: true,
          roomMembers: {
            select: { user: { select: { id: true, username: true } } }
          }
        }
      });
      res.status(201).json(newRoom);
    }
  } catch (err) {
    console.log(err);
  }
});

app.get('/get-message', auth, async (req: Request, res: Response) => {
  const { roomId, userId } = req.query;

  try {
    const message = await prisma.message.findMany({
      where: {
        roomId: (roomId as string) || '1',
        sentBy: { userId: userId as string }
      },

      select: {
        messageId: true,
        memberId: false,
        sentBy: {
          select: {
            user: {
              select: {
                username: true,
                id: true
              }
            }
          }
        },
        content: true,
        timeSent: true,
        roomId: true,
        seen: true
      },
      orderBy: {
        messageId: 'desc'
      },
      take: 1
    });

    if (!message) throw Error;

    const formattedMessage = {
      ...message[0],
      sentBy: {
        userId: message[0].sentBy.user.id,
        username: message[0].sentBy.user.username
      }
    };

    res.json(formattedMessage);
  } catch (err) {
    console.log(err);
  }
});

app.get('/get-messages', auth, async (req: Request, res: Response) => {
  const { roomId, limit } = req.query;

  try {
    const messages = await prisma.message.findMany({
      where: {
        roomId: (roomId as string) || '1'
      },

      select: {
        messageId: true,
        memberId: false,
        sentBy: {
          select: {
            user: {
              select: {
                username: true,
                id: true
              }
            }
          }
        },
        content: true,
        timeSent: true,
        roomId: true,
        seen: true
      },
      orderBy: { messageId: 'desc' },
      take: Number(limit) || -1
    });

    const formattedMessages = messages.map(message => {
      const time = new Date(message.timeSent).toLocaleTimeString('pl', {
        timeStyle: 'short',
        hour12: false
      });
      return {
        ...message,
        sentBy: {
          userId: message.sentBy.user.id,
          username: message.sentBy.user.username
        },
        timeSent: time
      };
    });

    res.json(formattedMessages);
  } catch (err) {
    console.log(err);
  }
});

io.on('connection', socket => {
  console.log('Made socket connection');

  socket.on('joinRoom', (roomId: string) => {
    socket.join(roomId);
    console.log(`user joined room: ${roomId}`);
  });

  socket.on('leaveRoom', (roomId: string) => {
    socket.leave(roomId);
    console.log(`user left room ${roomId}`);
  });

  socket.on(
    'message',
    async ({
      content,
      sentBy,
      roomId
    }: {
      content: string;
      sentBy: string;
      roomId: string;
    }) => {
      try {
        const member = await prisma.roomMember.findFirst({
          where: { roomId, userId: sentBy }
        });

        if (member) {
          const message = await createNewMessage({
            content,
            roomId,
            membershipId: member.membershipId
          });

          socket.in(roomId).emit('message', {
            ...message,
            sentBy: {
              userId: message.sentBy.user.id,
              username: message.sentBy.user.username
            },
            roomId
          });

          console.log(`message emitted to: ${message.roomId}`);
        }
      } catch (err) {
        console.log(err);
      }
    }
  );

  socket.on(
    'typing',
    ({ username, roomId }: { username: string; roomId: string }) => {
      socket.to(roomId).emit('typing', username);
    }
  );

  socket.on('seen', ({ user, roomId }: { user: string; roomId: string }) => {
    socket.in(roomId).emit('msgSeen', user);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});
