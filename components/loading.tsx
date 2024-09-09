'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

import ReduxProvider from '@/store/redux-provider';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/store';

const Loading = () => {
  const isLoading = useAppSelector((state) => state.workspace.isLoading);

  return (
    <div
      className={cn(
        'fixed h-full w-full flex items-center justify-center backdrop-blur-xl z-50',
        {
          hidden: !isLoading,
        }
      )}
    >
      <Loader2 size={32} className='animate-spin' />
    </div>
  );
};

const LoadingWrapper = () => {
  return (
    <ReduxProvider>
      <Loading />
    </ReduxProvider>
  );
};

export default LoadingWrapper;
