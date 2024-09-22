'use client';

import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { LogIn, LogOut } from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/store/store';
import { Button } from '@/components/ui/button';
import { setIsGuest } from '@/store/authSlice';
import { setIsLoading } from '@/store/workspaceSlice';

export default function AuthButton() {
  const { data: session } = useSession();
  const router = useRouter();

  const isGuest = useAppSelector((state) => state.auth.isGuest);
  const dispatch = useAppDispatch();

  const handleClick = async () => {
    if (isGuest || !session) {
      router.push('/login');
    } else {
      dispatch(
        setIsLoading({
          value: true,
          message: 'Logging out...',
          type: 'success',
        })
      );
      await signOut({ callbackUrl: '/login' });
      dispatch(setIsGuest(false));
      router.push('/');
      dispatch(
        setIsLoading({
          value: false,
          message: 'Logged out with successfully',
          type: 'success',
        })
      );
    }
  };

  return (
    <Button size='icon' onClick={handleClick}>
      {isGuest ? <LogIn size={16} /> : <LogOut size={16} />}
    </Button>
  );
}
