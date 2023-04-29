'use client';

import { FC, useState } from 'react';
import { toast } from 'react-hot-toast';
import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc/';

import Button from '@/components/ui/Button';

interface LoginProps {}

const Login: FC<LoginProps> = ({}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await signIn('google');
    } catch (e) {
      toast.error('Something went wrong with google login');
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='w-full flex flex-col items-center max-w-md space-y-8'>
        <div className='flex flex-col items-center gap-8'>
          logo
          <h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-gray-900'>
            Sign in to your account
          </h2>
        </div>

        <Button
          type='button'
          isLoading={isLoading}
          onClick={loginWithGoogle}
          className='max-w-sm mx-auto w-full'
        >
          {!isLoading && <FcGoogle size={20} />}
          <span className='ml-2'>Google</span>
        </Button>
      </div>
    </div>
  );
};

export default Login;
