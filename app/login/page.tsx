'use client';

import { signIn, useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import ReduxProvider from '@/store/redux-provider';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/store/store';
import { setIsGuest } from '@/store/authSlice';
import { setIsLoading } from '@/store/workspaceSlice';

const Login = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const dispatch = useAppDispatch();

  const handleLogin = async () => {
    dispatch(
      setIsLoading({
        value: true,
        message: 'Logging in with GitHub...',
        type: 'success',
      })
    );
    await signIn('github', { callbackUrl: '/login' });
    dispatch(setIsGuest(false));
    router.push('/');
    dispatch(
      setIsLoading({
        value: false,
        message: 'Logged in with GitHub successfully',
        type: 'success',
      })
    );
  };

  const handleGuest = () => {
    dispatch(setIsGuest(true));
    router.push('/');
  };

  return status === 'loading' ? (
    <div className='flex items-center justify-center grow'>
      <div className='h-min gap-2 flex flex-col w-full max-w-96 px-2'>
        <Button disabled>
          <div className='flex items-center justify-center'>
            <Loader2 size={16} className='animate-spin' />
          </div>
        </Button>
      </div>
    </div>
  ) : !session ? (
    <div className='flex items-center justify-center h-full w-full'>
      <div className='h-min gap-2 flex flex-col w-full max-w-96 px-2'>
        <Button onClick={handleLogin}>
          <span>
            Log in with
            <span className='font-bold'> GitHub</span>
          </span>
        </Button>
        <Button variant='outline' onClick={handleGuest}>
          <span>
            Continue as
            <span className='font-bold'> Guest</span>
          </span>
        </Button>
      </div>
    </div>
  ) : (
    (redirect('/'), null)
  );
};

const LoginWrapper = () => (
  <ReduxProvider>
    <Login />
  </ReduxProvider>
);

export default LoginWrapper;
