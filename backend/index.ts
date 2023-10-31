import env from 'dotenv';
import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { prisma } from './prisma';
import auth from './src/middleware/auth';

import {
  createNewMessage,
  createUser,
  getAllRooms,
  getMessage,
  getUser,
  loginUser
} from './src/queries';

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
  const userData: { email: string; username: string; password: string } =
    req.body;

  const existingUser = await prisma.chatUser.findFirst({
    where: { email: userData.email }
  });

  if (existingUser) {
    res.status(400).send('Email already in use');
    return;
  }

  try {
    const userWithToken = await createUser(userData);
    res.status(201).json({ ok: true, userData: { ...userWithToken } });
  } catch (err) {
    console.log(err);
  }
});

app.post('/login', async (req: Request, res: Response) => {
  try {
    const data: { email: string; password: string } = req.body;

    const user = await getUser(data.email);

    if (user) {
      const userWithUpdatedToken = await loginUser(user, data.password);

      if (userWithUpdatedToken) {
        res
          .status(200)
          .json({ ok: true, userData: { ...userWithUpdatedToken } });
      }
    } else {
      res.status(400).send({ ok: false, error: 'User not found' });
    }
  } catch (err) {
    if (typeof err === 'string') console.log(err);
  }
});

app.get('/get-rooms', auth, async (req: Request, res: Response) => {
  const { userID } = req.query;
  console.log('fetching rooms');
  try {
    const rooms = await getAllRooms(String(userID));

    res.status(200).json(rooms);
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
});

app.post('/new-room', auth, async (req: Request, res: Response) => {
  try {
    const data: { userID: string; email: string } = req.body;

    const addedUserData = await prisma.chatUser.findFirst({
      where: { email: data.email },
      select: {
        ID: true
      }
    });

    if (addedUserData) {
      const timeJoined = new Date().toISOString();
      const newRoom = await prisma.room.create({
        data: {
          roomMembers: {
            create: [
              { userID: data.userID, timeJoined },
              { userID: addedUserData.ID, timeJoined }
            ]
          }
        },
        select: {
          roomID: true,
          roomMembers: {
            select: { user: { select: { ID: true, username: true } } }
          }
        }
      });
      res.status(201).json({ ok: true, room: newRoom });
    } else {
      res.status(204).send({ ok: false, error: 'User not found' });
    }
  } catch (err) {
    console.log(err);
  }
});

app.get('/get-message', auth, async (req: Request, res: Response) => {
  const { roomID, userID } = req.query;

  try {
    const message = await getMessage(roomID as string, userID as string);

    res.status(200).json(message);
  } catch (err) {
    console.log(err);
  }
});

app.get('/get-messages', auth, async (req: Request, res: Response) => {
  const { roomID, limit } = req.query;

  console.log('fetching messages');
  try {
    const messages = await prisma.message.findMany({
      where: {
        roomID: (roomID as string) || '1'
      },

      select: {
        messageID: true,
        memberID: false,
        sentBy: {
          select: {
            user: {
              select: {
                username: true,
                ID: true
              }
            }
          }
        },
        content: true,
        timeSent: true,
        roomID: true,
        seen: true
      },
      orderBy: { messageID: 'desc' },
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
          userID: message.sentBy.user.ID,
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

  socket.on('joinRoom', (roomID: string) => {
    socket.join(roomID);
    console.log(`user joined room: ${roomID}`);
  });

  socket.on('leaveRoom', (roomID: string) => {
    socket.leave(roomID);
    console.log(`user left room ${roomID}`);
  });

  socket.on(
    'message',
    async ({
      content,
      sentBy,
      roomID
    }: {
      content: string;
      sentBy: string;
      roomID: string;
    }) => {
      try {
        const member = await prisma.roomMember.findFirst({
          where: { roomID, userID: sentBy }
        });

        if (member) {
          const message = await createNewMessage({
            content,
            roomID,
            memberID: member.memberID
          });

          socket.in(roomID).emit('message', {
            ...message,
            sentBy: {
              userID: message.sentBy.user.ID,
              username: message.sentBy.user.username
            },
            roomID
          });

          console.log(`message emitted to: ${message.roomID}`);
        }
      } catch (err) {
        console.log(err);
      }
    }
  );

  socket.on(
    'typing',
    ({ username, roomID }: { username: string; roomID: string }) => {
      socket.to(roomID).emit('typing', username);
    }
  );

  socket.on('seen', ({ user, roomID }: { user: string; roomID: string }) => {
    socket.in(roomID).emit('msgSeen', user);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});
