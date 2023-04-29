'use client';

import { toast } from 'react-hot-toast';
import { FC, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { pusherClient } from '@/lib/pusher';
import UnseenChatToast from './UnseenChatToast';
import { chatHrefConstructor, toPusherKey } from '@/lib/utils';

interface SidebarChatListProps {
  friends: User[];
  currentUserId: string;
}

interface ExtendedMessage extends Message {
  senderImage: string;
  senderName: string;
}

const SidebarChatList: FC<SidebarChatListProps> = ({
  friends,
  currentUserId,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);
  const [activeChats, setActiveChats] = useState<User[]>(friends);

  useEffect(() => {
    setActiveChats(friends);
  }, [friends]);

  useEffect(() => {
    const chatSubscription = pusherClient.subscribe(
      toPusherKey(`user:${currentUserId}:chats`)
    );
    const friendsSubscription = pusherClient.subscribe(
      toPusherKey(`user:${currentUserId}:friends`)
    );

    const chatHandler = (message: ExtendedMessage) => {
      const shouldNotify =
        pathname !==
        `dashboar/chat/${chatHrefConstructor(currentUserId, message.senderId)}`;

      if (!shouldNotify) {
        return;
      }

      toast.custom((t) => (
        <UnseenChatToast
          t={t}
          senderId={message.senderId}
          senderMessage={message.text}
          currentUserId={currentUserId}
          senderName={message.senderName}
          senderImage={message.senderImage}
        />
      ));

      setUnseenMessages((prev) => [...prev, message]);
    };

    const newFriendHandler = (newFriend: User) => {
      setActiveChats((prev) => [...prev, newFriend]);
    };

    const chatBind = pusherClient.bind('new_message', chatHandler);
    const friendBind = pusherClient.bind('new_friend', newFriendHandler);

    return () => {
      chatSubscription.unsubscribe();
      friendsSubscription.unsubscribe();
      chatBind.unbind();
      friendBind.unbind();
    };
  }, [pathname, currentUserId]);

  useEffect(() => {
    setUnseenMessages((prev) => {
      return prev.filter((message) => !pathname?.includes(message.senderId));
    });
  }, [pathname]);

  return (
    <ul role='list' className='max-h-[25rem] overflow-y-auto -mx-2 space-y-1'>
      {activeChats.sort().map((friend) => {
        const unseenMessageCount = unseenMessages.filter(
          (unseenmsg) => unseenmsg.senderId === friend.id
        ).length;

        return (
          <li key={friend.id}>
            <a
              href={`/dashboard/chat/${chatHrefConstructor(
                currentUserId,
                friend.id
              )}`}
              className='text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
            >
              {friend.name}
              {unseenMessageCount > 0 ? (
                <div className='bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center'>
                  {unseenMessageCount}
                </div>
              ) : null}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default SidebarChatList;
