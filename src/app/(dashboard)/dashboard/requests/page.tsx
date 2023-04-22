import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { fetchRedis } from '@/helper/redis';
import FriendRequests from '@/components/FriendRequests';

interface PageProps {}

const Page = async (props: PageProps) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    notFound();
  }

  const incomingRequestSenderIds = (await fetchRedis(
    'smembers',
    `user:${session.user.id}:incoming_friend_requests`
  )) as string[];

  const requestSenders = await Promise.all(
    incomingRequestSenderIds.map(async (senderId) => {
      const sender = (await fetchRedis('get', `user:${senderId}`)) as string;
      const senderParsed = JSON.parse(sender) as User;

      return {
        id: senderParsed.id,
        name: senderParsed.name,
        image: senderParsed.image,
        email: senderParsed.email,
      } as IncomingFriendRequest;
    })
  );

  return (
    <main className='pt-8'>
      <h1 className='font-bold text-5xl mb-8'>Fried requests</h1>
      <div className='flex flex-col gap-4'>
        <FriendRequests
          sessionid={session.user.id}
          incomingFriendRequests={requestSenders}
        />
      </div>
    </main>
  );
};

export default Page;
