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
        id: randomUUID()
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
      { user_id: user.id, email: user.email },
      process.env.TOKEN_KEY as jwt.Secret,
      {
        expiresIn: '2h'
      }
    );

    const completeUser = await prisma.user.update({
      where: {
        id: user.id
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
          { userId: (await users[0]).id, timeJoined },
          { userId: (await users[1]).id, timeJoined }
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
