'use client';

import { FC } from 'react';
import TestButton from './TestButton';

interface TestCompProps {
  session: any;
}

const TestComp: FC<TestCompProps> = ({ session }) => {
  return (
    <div onClick={() => console.log('From test component')}>
      TestComp
      <br />
      <TestButton session={session} />
    </div>
  );
};

export default TestComp;
