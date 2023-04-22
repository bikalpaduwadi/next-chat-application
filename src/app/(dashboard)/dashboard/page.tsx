import React from 'react';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function page() {
  const _handleOnClick = async () => {};
  const session = await getServerSession(authOptions);

  return (
    <>
      <code>{JSON.stringify(session)}</code>
    </>
  );
}
