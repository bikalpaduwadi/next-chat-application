import { fetchRedis } from '@/helper/redis';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { pusherServer } from '@/lib/pusher';
import { toPusherKey } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { id: userId } = z.object({ id: z.string() }).parse(body);

    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    // verify if the user is already friends
    const isAlreadyFriends = await fetchRedis(
      'sismember',
      `user:${session.user.id}:friends`,
      userId
    );

    if (isAlreadyFriends) {
      return new Response('Already friends', { status: 400 });
    }

    const hasFriendRequest = await fetchRedis(
      'sismember',
      `user:${session.user.id}:incoming_friend_requests`,
      userId
    );

    if (!hasFriendRequest) {
      return new Response('Friend request is not sent by the user', {
        status: 400,
      });
    }

    // Notify both users

    pusherServer.trigger(
      toPusherKey(`user:${userId}:friends`),
      'new_friend',
      {}
    );

    await db.sadd(`user:${session.user.id}:friends`, userId);
    await db.sadd(`user:${userId}:friends`, session.user.id);

    await db.srem(`user:${session.user.id}:incoming_friend_requests`, userId);
    // await db.srem(`user:${userId}:outbound_friend_request`, session.user.id);

    return new Response('OK');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid request payload', { status: 422 });
    }

    return new Response('Invalid request', { status: 400 });
  }
}
