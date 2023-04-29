import { db } from '@/lib/db';

const Page = async () => {
  await db.set('myKey', 'myValue');

  return <div>page</div>;
};

export default Page;
