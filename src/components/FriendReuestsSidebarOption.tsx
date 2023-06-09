'use client';

import Link from 'next/link';
import { User } from 'lucide-react';
import { FC, useEffect, useState } from 'react';

import { toPusherKey } from '@/lib/utils';
import { pusherClient } from '@/lib/pusher';

interface FriendRequestsSidebarOptionProps {
  sessionId: string;
  initialUnseenRequestCount: number;
}

const FriendRequestsSidebarOption: FC<FriendRequestsSidebarOptionProps> = ({
  sessionId,
  initialUnseenRequestCount,
}) => {
  const [unseenRequestCount, setUnseenRequestCount] = useState<number>(
    initialUnseenRequestCount
  );

  useEffect(() => {
    const subscription = pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:incoming_friend_requests`)
    );

    const friendsSubscription = pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:friends`)
    );

    const friendRequestHandler = () => {
      setUnseenRequestCount((prev) => prev + 1);
    };

    const newFriendHandler = () => {
      setUnseenRequestCount((prev) => prev - 1);
    };

    const bind = pusherClient.bind(
      'incoming_friend_requests',
      friendRequestHandler
    );

    const friendsBind = pusherClient.bind('new_friend', newFriendHandler);

    return () => {
      subscription.unsubscribe();
      bind.unbind();

      friendsSubscription.unsubscribe();
      friendsBind.unbind();
    };
  }, [sessionId]);

  useEffect(() => {
    setUnseenRequestCount(initialUnseenRequestCount);
  }, [initialUnseenRequestCount]);

  return (
    <Link
      href='/dashboard/requests'
      className='-mx-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
    >
      <div className='text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white'>
        <User className='h-4 w-4' />
      </div>
      <p className='truncate'>Friend requests</p>
      {!!unseenRequestCount && (
        <div className='rounded-full w-5 h-5 text-sm flex justify-center items-center text-white bg-indigo-600'>
          {unseenRequestCount}
        </div>
      )}
    </Link>
  );
};

export default FriendRequestsSidebarOption;
