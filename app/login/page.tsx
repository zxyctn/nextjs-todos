'use client';

import { useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import ReduxProvider from '@/store/redux-provider';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/store/store';
import { setIsGuest } from '@/store/authSlice';
import { setIsLoading } from '@/store/workspaceSlice';

const Login = () => {
  const { data: session } = useSession();
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

  const handleGuest = async () => {
    dispatch(setIsGuest(true));
    router.push('/');
  };

  useEffect(() => {
    if (session) {
      dispatch(setIsGuest(false));
      router.push('/');
    }
  }, [session]);

  return (
    <div className='fixed top-0 left-0 flex items-center justify-center w-screen h-screen'>
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
  );
};

const LoginWrapper = () => (
  <ReduxProvider>
    <Login />
  </ReduxProvider>
);

export default LoginWrapper;
