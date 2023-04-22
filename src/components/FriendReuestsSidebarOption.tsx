'use client';

import Link from 'next/link';
import { User } from 'lucide-react';
import { FC, useEffect, useState } from 'react';

interface FriendReuestsSidebarOptionProps {
  sessionId: string;
  initialUnseenRequestCount: number;
}

const FriendReuestsSidebarOption: FC<FriendReuestsSidebarOptionProps> = ({
  sessionId,
  initialUnseenRequestCount,
}) => {
  const [unseenRequestCount, setUnseenRequestCount] = useState<number>(
    initialUnseenRequestCount
  );

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

export default FriendReuestsSidebarOption;