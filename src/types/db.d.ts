interface User {
  id: string;
  name: string;
  email: string;
  image: string;
}

interface Chat {
  id: string;
  messages: Message[];
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  timeStamp: number;
  receiverId: string;
}

interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
}
