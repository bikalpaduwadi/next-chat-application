'use client';

import { z } from 'zod';
import { FC, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Button from './ui/Button';
import { addFriendValidator } from '@/lib/validation/add-friend';

interface AddFriendButtonProps {}

type AddFriedFormData = z.infer<typeof addFriendValidator>;

const AddFriendButton: FC<AddFriendButtonProps> = ({}) => {
  const [showSuccessState, setShowSuccessState] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AddFriedFormData>({
    resolver: zodResolver(addFriendValidator),
  });

  const addFriend = async (email: string) => {
    try {
      const validatedEmail = addFriendValidator.parse({ email });

      await axios.post('/api/friends/add', { email: validatedEmail });

      setShowSuccessState(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError('email', { message: error.message });
        return;
      }

      if (error instanceof AxiosError) {
        setError('email', { message: error.response?.data });
        return;
      }

      setError('email', { message: 'Something wen wrong.' });
    }
  };

  const onSubmit = (data: AddFriedFormData) => {
    addFriend(data.email);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='max-w-sm'>
      <label
        htmlFor='email'
        className='block text-sm font-medium leading-6 text-gray-900'
      >
        {' '}
        Add friend by E-mail
      </label>

      <div className='mt-2 flex gap-4'>
        <input
          type='text'
          className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow=sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inse focus:ring-indigo-600 sm:text-sm sm:leading-6'
          placeholder='you@example.com'
          {...register('email')}
        />
        <Button>Add</Button>
      </div>
      <p className='mt-1 text-sm text-red-600'>{errors.email?.message}</p>
      {showSuccessState && (
        <p className='mt-1 text-sm text-green-600'>Friend request sent !!</p>
      )}
    </form>
  );
};

export default AddFriendButton;
