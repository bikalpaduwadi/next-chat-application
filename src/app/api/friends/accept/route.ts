import { promise, z } from 'zod';
import { getServerSession } from 'next-auth';

import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { toPusherKey } from '@/lib/utils';
import { fetchRedis } from '@/helper/redis';
import { pusherServer } from '@/lib/pusher';

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

    const [userResponse, friendResponse] = (await Promise.all([
      fetchRedis('get', `user:${session.user.id}`),
      fetchRedis('get', `user:${userId}`),
    ])) as [string, string];

    const userData = JSON.parse(userResponse) as User;
    const friendData = JSON.parse(friendResponse) as User;

    // Save and Notify both users

    await Promise.all([
      pusherServer.trigger(
        toPusherKey(`user:${userId}:friends`),
        'new_friend',
        userData
      ),
      pusherServer.trigger(
        toPusherKey(`user:${session.user.id}:friends`),
        'new_friend',
        friendData
      ),

      db.sadd(`user:${session.user.id}:friends`, userId),
      db.sadd(`user:${userId}:friends`, session.user.id),

      db.srem(`user:${session.user.id}:incoming_friend_requests`, userId),
    ]);

    // await db.srem(`user:${userId}:outbound_friend_request`, session.user.id);

    return new Response('OK');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid request payload', { status: 422 });
    }

    return new Response('Invalid request', { status: 400 });
  }
}
