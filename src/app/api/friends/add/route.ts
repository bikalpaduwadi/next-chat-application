import { z } from 'zod';
import { getServerSession } from 'next-auth';

import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { toPusherKey } from '@/lib/utils';
import { pusherServer } from '@/lib/pusher';
import { fetchRedis } from '@/helper/redis';
import { addFriendValidator } from '@/lib/validation/add-friend';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email: emailAddress } = addFriendValidator.parse(body.email);

    const idToAdd = (await fetchRedis(
      'get',
      `user:email:${emailAddress}`
    )) as string;

    if (!idToAdd) {
      return new Response('The user does not exit', { status: 400 });
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (idToAdd === session.user.id) {
      return new Response('You cannot add yourself as a friend', {
        status: 400,
      });
    }

    // Check if user is already added
    const isAlreadyAdded = await fetchRedis(
      'sismember',
      `user:${idToAdd}:incoming_friend_requests`,
      session.user.id
    );

    if (!!isAlreadyAdded) {
      return new Response('Already added this user', {
        status: 400,
      });
    }

    // Check if user is already added
    const isAlreadyFriends = await fetchRedis(
      'sismember',
      `user:${idToAdd}:friends`,
      session.user.id
    );

    if (!!isAlreadyFriends) {
      return new Response('Already friends with this user', {
        status: 400,
      });
    }

    console.log('Trigger pusher.....');

    pusherServer.trigger(
      toPusherKey(`user:${idToAdd}:incoming_friend_requests`),
      'incoming_friend_requests',
      {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }
    );

    db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);

    return new Response('Successfully added a friend', { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid request payload', { status: 422 });
    }

    return new Response('Invalid request', { status: 400 });
  }
}
