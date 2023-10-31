import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function main() {
  const users = [
    { email: 'user@user.com', username: 'user', ID: '1' },
    { email: 'user2@user.com', username: 'user2', ID: '2' },
    { email: 'user3@user.com', username: 'user3', ID: '3' }
  ].map(async ({ email, username, ID }) => {
    const password = await bcrypt.hash(username, 10);

    const user = await prisma.chatUser.upsert({
      where: {
        ID
      },
      update: {},
      create: {
        ID,
        email,
        username,
        password,
        token: ''
      }
    });

    const token = jwt.sign(
      { user_id: user.ID, email: user.email },
      process.env.TOKEN_KEY as jwt.Secret,
      {
        expiresIn: '2h'
      }
    );

    const completeUser = await prisma.chatUser.update({
      where: {
        ID: user.ID
      },
      data: {
        token
      }
    });

    return completeUser;
  });

  const timeJoined = new Date().toISOString();
  await prisma.room.upsert({
    where: {
      roomID: '1'
    },
    update: {},
    create: {
      roomID: '1',
      roomMembers: {
        create: [
          { userID: (await users[0]).ID, timeJoined },
          { userID: (await users[1]).ID, timeJoined }
        ]
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
  });
