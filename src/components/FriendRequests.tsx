'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';
import { Check, UserPlus, X } from 'lucide-react';

interface FriendRequestsProps {
  sessionid: string;
  incomingFriendRequests: IncomingFriendRequest[];
}

const FriendRequests: FC<FriendRequestsProps> = ({
  sessionid,
  incomingFriendRequests,
}) => {
  const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
    incomingFriendRequests || []
  );

  const router = useRouter();

  useEffect(() => {
    setFriendRequests(incomingFriendRequests);
  }, [incomingFriendRequests]);

  const acceptFriendRequest = async (senderId: string) => {
    await axios.post('/api/friends/accept', { id: senderId });

    setFriendRequests((prev) =>
      prev.filter((request) => request.id !== senderId)
    );

    router.refresh();
  };

  const denyFriendRequest = async (senderId: string) => {
    await axios.post('/api/friends/deny', { id: senderId });

    setFriendRequests((prev) =>
      prev.filter((request) => request.id !== senderId)
    );

    router.refresh();
  };

  return (
    <>
      {incomingFriendRequests.length ? (
        friendRequests.map((request) => {
          return (
            <div key={request.id} className='flex gap-4 items-center'>
              <UserPlus className='text-black' />
              <p className='font-medium'>
                {`${request.name} `}
                <span className='underline text-blue-600'>
                  ({request.email})
                </span>
              </p>
              <button
                onClick={() => acceptFriendRequest(request.id)}
                aria-label='accept friend'
                className='w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md'
              >
                <Check className='font-semibold text-white w-3/4 h-3/4' />
              </button>
              <button
                onClick={() => denyFriendRequest(request.id)}
                aria-label='accept friend'
                className='w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md'
              >
                <X className='font-semibold text-white w-3/4 h-3/4' />
              </button>
            </div>
          );
        })
      ) : (
        <p className='font-sm text-zinc-500'>
          Friend requests not available...
        </p>
      )}
    </>
  );
};

export default FriendRequests;
