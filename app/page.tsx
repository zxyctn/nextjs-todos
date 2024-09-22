'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, Waves } from 'lucide-react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';

import ReduxProvider from '@/store/redux-provider';
import TaskGroup from '@/components/task-group';
import { handleDragEnd } from '@/lib/utils';
import { useAppSelector, useAppDispatch } from '@/store/store';
import {
  GroupWithOrderedTasks,
  setCurrentWorkspace,
  setIsLoading,
  setWorkspaces,
} from '@/store/workspaceSlice';
import { setIsGuest, setUser } from '@/store/authSlice';

const Home = () => {
  const { data: session } = useSession();

  const workspaceState = useAppSelector((state) => state.workspace);
  const currentWorkspace = useAppSelector((state) => state.workspace.current);
  const isGuest = useAppSelector((state) => state.auth.isGuest);
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [isFetching, setIsFetching] = useState(false);

  const isLoading = useAppSelector((state) => state.workspace.isLoading);
  const isDragDisabled = useAppSelector(
    (state) => state.workspace.isDragDisabled.value
  );

  const fetchWorkspaces = async () => {
    if (!isGuest) {
      setIsFetching(true);
      const res = await fetch('/api/workspace');
      setIsFetching(false);

      if (!res) {
        console.error('Failed fetching workspaces');
        throw new Error('Failed fetching workspaces');
      }

      const { workspaces, selected } = await res.json();

      if (!workspaces.length) {
        return;
      }

      dispatch(setWorkspaces(workspaces));
      dispatch(setCurrentWorkspace(selected));
    }
  };

  useEffect(() => {
    if (isLoading.value) {
      toast.loading(isLoading.message, {
        id: 'loading',
      });
    } else {
      if (isLoading.type === 'success') {
        toast.success(isLoading.message, {
          id: 'loading',
          duration: 1000,
        });
      } else {
        toast.error(isLoading.message, {
          id: 'loading',
          duration: 2000,
        });
      }
    }
  }, [isLoading, isDragDisabled]);

  useEffect(() => {
    if (user || isGuest) {
      const init = async () => {
        dispatch(
          setIsLoading({
            value: true,
            message: 'Fetching workspaces...',
            type: 'success',
          })
        );
        await fetchWorkspaces();
        dispatch(
          setIsLoading({
            value: false,
            message: 'Fetched workspaces successfully',
            type: 'success',
          })
        );
      };

      init();
    }
  }, [user, isGuest]);

  useEffect(() => {
    if (session) {
      dispatch(setUser(session.user));
      dispatch(setIsGuest(false));
    } else {
      dispatch(setUser(null));
      if (isGuest === false) {
        router.push('/login');
      }
    }
  }, [session]);

  return (!isGuest && !user) || isFetching ? (
    <div className='fixed top-0 left-0 w-screen h-screen flex items-center justify-center'>
      <Loader2 size={24} className='animate-spin' />
    </div>
  ) : (
    <div className='flex justify-center pb-20 pt-4 sm:pt-8'>
      <div className='grow'>
        <DragDropContext
          onDragEnd={(result) =>
            handleDragEnd(result, isGuest, dispatch, currentWorkspace)
          }
        >
          <Droppable
            droppableId='workspace'
            direction='horizontal'
            type='group'
          >
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                <div className='flex justify-start'>
                  {currentWorkspace.orderedGroups.map(
                    (group: GroupWithOrderedTasks, index: number) => (
                      <TaskGroup
                        key={group.id}
                        groupId={group.id}
                        index={index}
                      />
                    )
                  )}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {workspaceState.current.groups.length === 0 &&
        workspaceState.workspaces.length > 0 && (
          <div className='fixed flex flex-col gap-2 items-center justify-center text-muted-foreground h-full w-full'>
            <Waves />
            <span className='text-xs'>No groups in this workspace</span>
          </div>
        )}

      {workspaceState.workspaces.length === 0 && (
        <div className='fixed flex flex-col gap-2 items-center justify-center text-muted-foreground h-full w-full'>
          <Waves />
          <span className='text-xs'>No workspaces</span>
        </div>
      )}
    </div>
  );
};

const HomeWrapper = () => {
  return (
    <ReduxProvider>
      <Home />
    </ReduxProvider>
  );
};

export default HomeWrapper;
