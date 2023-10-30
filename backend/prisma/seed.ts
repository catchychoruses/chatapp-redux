import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function main() {
  const users = [
    { email: 'user@user.com', username: 'user' },
    { email: 'user2@user.com', username: 'user2' },
    { email: 'user3@user.com', username: 'user3' }
  ].map(async ({ email, username }) => {
    const password = await bcrypt.hash(username, 10);

    const user = await prisma.user.upsert({
      where: {
        ID: randomUUID()
      },
      update: {},
      create: {
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

    const completeUser = await prisma.user.update({
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
  await prisma.room.create({
    data: {
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
