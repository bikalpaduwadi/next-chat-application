import { FC } from 'react';
import { db } from '@/lib/db';

interface pageProps {}

const Page = async () => {
  await db.set('myKey', 'myValue');

  return <div>page</div>;
};

export default Page;
