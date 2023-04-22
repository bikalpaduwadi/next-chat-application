import { FC } from 'react';

interface TestButtonProps {
  session: any;
}

const TestButton: FC<TestButtonProps> = ({ session }) => {
  return (
    <>
      <div onClick={() => console.log('test button')}>TestButton</div>
      <code>{JSON.stringify(session)}</code>
    </>
  );
};

export default TestButton;
