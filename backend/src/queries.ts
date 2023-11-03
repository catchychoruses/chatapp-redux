import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

interface UserData {
  ID: string;
  username: string;
  email: string;
  password: string;
  token: string;
}

type UserWithToken = Omit<UserData, 'password'>;

type UserCreationData = Omit<UserData, 'ID' | 'token'>;

export const createUser = async (userData: UserCreationData) => {
  const encryptedPassword = await bcrypt.hash(userData.password, 10);

  const user = await prisma.user.create({
    data: {
      username: String(userData.username),
      password: encryptedPassword,
      token: '',
      email: userData.email
    }
  });

  const token = jwt.sign(
    { user_ID: user.ID, email: userData.email },
    process.env.TOKEN_KEY as jwt.Secret,
    {
      expiresIn: '2h'
    }
  );

  const userWithToken = await prisma.user.update({
    where: {
      ID: user.ID
    },
    data: {
      token
    },
    select: {
      password: false,
      ID: true,
      username: true,
      email: true,
      token: true
    }
  });

  return userWithToken;
};

export const getUser = async (email: string): Promise<UserData | null> => {
  const user = await prisma.user.findFirst({
    where: { email }
  });

  return user;
};

export const loginUser = async (
  user: UserData,
  password: string
): Promise<UserWithToken | undefined> => {
  if (await bcrypt.compare(user.password, password)) return undefined;

  const token = jwt.sign(
    { user_ID: user.ID, email: user.email },
    process.env.TOKEN_KEY as jwt.Secret,
    {
      expiresIn: '2h'
    }
  );

  const userWithUpdatedToken = await prisma.user.update({
    where: { ID: user.ID },
    data: { token },
    select: {
      ID: true,
      username: true,
      token: true,
      email: true
    }
  });

  return userWithUpdatedToken;
};

export const getAllRooms = async (userID: string) => {
  const rooms = await prisma.room.findMany({
    where: {
      roomMembers: {
        some: {
          userID
        }
      }
    },
    select: {
      roomID: true,
      roomMembers: {
        select: { user: { select: { ID: true, username: true } } }
      },
      messages: {
        take: 1,
        orderBy: { messageID: 'desc' }
      }
    }
  });

  const formattedRes = rooms.map(room => {
    const otherMember = room.roomMembers.filter(
      member => member.user.ID !== userID
    );
    const displayName = otherMember[0].user.username;

    return {
      roomID: room.roomID,
      members: room.roomMembers,
      displayName,
      lastMsg: {
        content: room.messages[0]?.content,
        timeSent: room.messages[0]?.timeSent,
        username: room.roomMembers[0].user.username
      }
    };
  });

  return formattedRes;
};

export const getMessage = async (roomID: string, userID: string) => {
  const message = await prisma.message.findMany({
    where: {
      roomID,
      sentBy: { userID }
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
    orderBy: {
      messageID: 'desc'
    },
    take: 1
  });

  if (!message) return undefined;

  const formattedMessage = {
    ...message[0],
    sentBy: {
      userID: message[0].sentBy.user.ID,
      username: message[0].sentBy.user.username
    }
  };

  return formattedMessage;
};

export const createNewMessage = async ({
  content,
  roomID,
  memberID
}: {
  content: string;
  roomID: string;
  memberID: number;
}) => {
  const timeSent = new Date().toISOString();

  const message = await prisma.message.create({
    data: {
      content,
      roomID,
      timeSent,
      memberID
    },

    include: {
      sentBy: {
        select: {
          user: {
            select: {
              username: true,
              ID: true
            }
          }
        }
      }
    }
  });

  const formattedTime = new Date().toLocaleTimeString('pl', {
    timeStyle: 'short',
    hour12: false
  });

  return { ...message, timeSent: formattedTime };
};
