import { prisma } from '../prisma';

export const getAllRooms = async (userId: string) => {
  const rooms = await prisma.room.findMany({
    where: {
      roomMembers: {
        some: {
          userId
        }
      }
    },
    select: {
      roomId: true,
      roomMembers: {
        select: { user: { select: { id: true, username: true } } }
      },
      messages: {
        take: 1,
        orderBy: { messageId: 'desc' }
      }
    }
  });

  const formattedRes = rooms.map(room => {
    const otherMember = room.roomMembers.filter(
      member => member.user.id !== userId
    );
    const displayName = otherMember[0].user.username;

    return {
      roomId: room.roomId,
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

export const createNewMessage = async ({
  content,
  roomId,
  membershipId
}: {
  content: string;
  roomId: string;
  membershipId: number;
}) => {
  const time = new Date().toISOString();

  const message = await prisma.message.create({
    data: {
      content,
      roomId,
      timeSent: time,
      memberId: membershipId
    },

    include: {
      sentBy: {
        select: {
          user: {
            select: {
              username: true,
              id: true
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
