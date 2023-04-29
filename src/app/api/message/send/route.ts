import { nanoid } from 'nanoid';
import { getServerSession } from 'next-auth';

import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { fetchRedis } from '@/helper/redis';
import { Message, messageValidator } from '@/lib/validation/message';
import { pusherServer } from '@/lib/pusher';
import { toPusherKey } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const { text, chatId } = await req.json();

    const session = await getServerSession(authOptions);

    const [userId1, userId2] = chatId.split('--');

    console.log('userid1', userId1);
    console.log('userid2', userId2);

    if (
      !session ||
      (session.user.id !== userId1 && session.user.id !== userId2)
    ) {
      return new Response('Unauthorized', { status: 401 });
    }

    const friendId = session.user.id === userId1 ? userId2 : userId1;

    const friendList = (await fetchRedis(
      'smembers',
      `user:${session.user.id}:friends`
    )) as string[];
    const isFriend = friendList.includes(friendId);

    if (!isFriend) {
      return new Response('You are not allowed to send message to this user', {
        status: 401,
      });
    }

    const senderResponse = (await fetchRedis(
      'get',
      `user:${session.user.id}`
    )) as string;

    const sender = JSON.parse(senderResponse) as User;

    console.log('sender', sender);

    const timeStamp = Date.now();

    const messageData: Message = {
      text,
      timeStamp,
      id: nanoid(),
      senderId: session.user.id,
    };

    const message = messageValidator.parse(messageData);

    // notify all connected chat partners/clients
    pusherServer.trigger(
      toPusherKey(`chat:${chatId}`),
      'incoming-message',
      message
    );

    pusherServer.trigger(toPusherKey(`user:${friendId}:chats`), 'new_message', {
      ...message,
      senderImage: sender.image,
      senderName: sender.name,
    });

    // Persist message in db;
    await db.zadd(`chat:${chatId}:messages`, {
      score: timeStamp,
      member: JSON.stringify(message),
    });

    return new Response('OK');
  } catch (error) {
    console.log('Error: ', error);
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    }

    return new Response('Internal server error', { status: 500 });
  }
}
