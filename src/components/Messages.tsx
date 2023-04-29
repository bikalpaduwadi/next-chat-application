'use client';

import Image from 'next/image';
import { format } from 'date-fns';
import { FC, useEffect, useRef, useState } from 'react';

import { cn, toPusherKey } from '@/lib/utils';
import { Message } from '@/lib/validation/message';
import { pusherClient } from '@/lib/pusher';

interface MessagesProps {
  chatId: string;
  chatPartner: User;
  currentUserId: string;
  currentUserImage: string;
  initialMessages: Message[];
}

const Messages: FC<MessagesProps> = ({
  chatId,
  chatPartner,
  currentUserId,
  initialMessages,
  currentUserImage,
}) => {
  const scrollDownRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState(initialMessages);

  const formatTimeStamp = (timeStamp: number) => {
    return format(timeStamp, 'HH:mm');
  };

  useEffect(() => {
    const subscription = pusherClient.subscribe(toPusherKey(`chat:${chatId}`));

    const messageHandler = (message: Message) => {
      setMessages((prev) => [message, ...prev]);
    };

    const bind = pusherClient.bind('incoming-message', messageHandler);

    return () => {
      subscription.unsubscribe();
      bind.unbind();
    };
  }, [chatId]);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  return (
    <div
      id='messages'
      className='flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch'
    >
      <div ref={scrollDownRef} />

      {messages.map((message, index) => {
        const isSentFromCurrentUser = message.senderId === currentUserId;
        const hasNextMessageFromSameUser =
          messages[index - 1]?.senderId === messages[index].senderId;

        return (
          <div
            key={`${message.id}-${message.timeStamp}`}
            className='chat-message'
          >
            <div
              className={cn('flex items-end', {
                'justify-end': isSentFromCurrentUser,
              })}
            >
              <div
                className={cn(
                  'flex flex-col space-y-2 text-base max-w-xs mx-2',
                  {
                    'order-1 items-end': isSentFromCurrentUser,
                    'order-2 items-start': !isSentFromCurrentUser,
                  }
                )}
              >
                <span
                  className={cn('px-4 py-2 rounded-lg inline-block', {
                    'bg-indigo-600 text-white': isSentFromCurrentUser,
                    'bg-gray-200 text-gray-900': !isSentFromCurrentUser,
                    'rounded-br-none':
                      !hasNextMessageFromSameUser && isSentFromCurrentUser,
                    'rounded-bl-none':
                      !hasNextMessageFromSameUser && !isSentFromCurrentUser,
                  })}
                >
                  {message.text}{' '}
                  <span className='ml-2 text-xs text-gray-400'>
                    {formatTimeStamp(message.timeStamp)}
                  </span>
                </span>
              </div>

              <div
                className={cn('relative w-6 h-6', {
                  'order-2': isSentFromCurrentUser,
                  'order-1': !isSentFromCurrentUser,
                  invisible: hasNextMessageFromSameUser,
                })}
              >
                <Image
                  fill
                  src={
                    isSentFromCurrentUser
                      ? (currentUserImage as string)
                      : (chatPartner.image as string)
                  }
                  alt='Profile Picture'
                  referrerPolicy='no-referrer'
                  className='rounded-full'
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Messages;
