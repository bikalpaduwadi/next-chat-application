'use client';

import { toast } from 'react-hot-toast';
import { signOut } from 'next-auth/react';
import { Loader2, LogOut } from 'lucide-react';
import { ButtonHTMLAttributes, FC, useState } from 'react';

import Button from './ui/Button';

interface SignOutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const SignOutButton: FC<SignOutButtonProps> = ({ ...props }) => {
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  const onSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      toast.error('Error: unable to signout');
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <Button {...props} variant='ghost' onClick={onSignOut}>
      {isSigningOut ? (
        <Loader2 className='animate-spin h-4 w-4' />
      ) : (
        <LogOut className='w-4 h-4' />
      )}
    </Button>
  );
};

export default SignOutButton;
