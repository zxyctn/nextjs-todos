'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, Waves } from 'lucide-react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';

import ReduxProvider from '@/store/redux-provider';
import TaskGroup from '@/components/task-group';
import { useAppSelector, useAppDispatch } from '@/store/store';
import {
  GroupWithOrderedTasks,
  moveGroup,
  moveTask,
  setCurrentWorkspace,
  setIsDragDisabled,
  setIsLoading,
  setWorkspaces,
  updateTaskContent,
} from '@/store/workspaceSlice';
import { setIsGuest, setUser } from '@/store/authSlice';

const Home = () => {
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

  const { data: session } = useSession();

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

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, type } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }
    if (type === 'task') {
      const sInd = source.droppableId.split('-')[1];
      const dInd = destination.droppableId.split('-')[1];
      const taskId = result.draggableId.split('-')[1];

      if (sInd === dInd && source.index === destination.index) return;

      dispatch(
        setIsDragDisabled({
          value: true,
          sourceDroppableId: sInd,
          destinationDroppableId: dInd,
        })
      );

      dispatch(
        setIsLoading({
          value: true,
          message: 'Moving task...',
          type: 'success',
        })
      );

      dispatch(
        moveTask({
          sourceGroupId: sInd,
          destinationGroupId: dInd,
          taskId,
          sourceIndex: source.index,
          destinationIndex: destination.index,
        })
      );

      if (!isGuest) {
        const res = await fetch(`/api/task/${taskId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            groupId: dInd,
            index: destination.index,
          }),
        });

        dispatch(
          setIsDragDisabled({
            value: false,
            sourceDroppableId: '',
            destinationDroppableId: '',
          })
        );

        if (!res.ok) {
          dispatch(
            moveTask({
              sourceGroupId: dInd,
              destinationGroupId: sInd,
              taskId,
              sourceIndex: destination.index,
              destinationIndex: source.index,
            })
          );

          dispatch(
            setIsLoading({
              value: false,
              message: 'Failed moving task',
              type: 'error',
            })
          );

          throw new Error('Failed moving task');
        }

        const { task, activity } = await res.json();

        if (activity) {
          dispatch(
            updateTaskContent({
              taskId: task.id,
              name: task.name,
              description: task.description,
              activityId: activity.id,
              activityContent: activity.content,
            })
          );
        } else {
          dispatch(
            updateTaskContent({
              taskId: task.id,
              name: task.name,
              description: task.description,
            })
          );
        }
      } else {
        dispatch(
          setIsDragDisabled({
            value: false,
            sourceDroppableId: '',
            destinationDroppableId: '',
          })
        );

        const task = workspaceState.current.groups
          .find((group) => group.id === sInd)
          ?.tasks.find((task) => task.id === taskId);

        const newGroup = workspaceState.current.groups.find(
          (group) => group.id === dInd
        );

        if (!task || !newGroup) {
          dispatch(
            setIsLoading({
              value: false,
              message: 'Failed moving task',
              type: 'error',
            })
          );

          throw new Error('Failed moving task');
        }

        const activity =
          sInd === dInd
            ? undefined
            : {
                id: `activity-${+new Date()}`,
                content: `Task moved to group ${newGroup.name}`,
              };

        if (activity) {
          dispatch(
            updateTaskContent({
              taskId: task.id,
              name: task.name,
              description: task.description || '',
              activityId: activity.id,
              activityContent: activity.content,
            })
          );
        } else {
          dispatch(
            updateTaskContent({
              taskId: task.id,
              name: task.name,
              description: task.description || '',
            })
          );
        }
      }

      dispatch(
        setIsLoading({
          value: false,
          message: 'Moved task successfully',
          type: 'success',
        })
      );
    } else {
      if (source.index === destination.index) return;

      const groupId = result.draggableId.split('-')[1];

      dispatch(
        setIsDragDisabled({
          value: true,
          sourceDroppableId: 'workspace',
          destinationDroppableId: 'workspace',
        })
      );

      dispatch(
        moveGroup({
          id: groupId,
          index: destination.index,
        })
      );

      dispatch(
        setIsLoading({
          value: true,
          message: 'Moving group...',
          type: 'success',
        })
      );

      if (!isGuest) {
        const res = await fetch(`/api/group/${groupId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            index: destination.index,
          }),
        });

        if (!res.ok) {
          dispatch(
            moveGroup({
              id: groupId,
              index: source.index,
            })
          );

          dispatch(
            setIsLoading({
              value: false,
              message: 'Failed moving group',
              type: 'error',
            })
          );

          dispatch(
            setIsDragDisabled({
              value: false,
              sourceDroppableId: '',
              destinationDroppableId: '',
            })
          );

          throw new Error('Failed moving group');
        }
      }

      dispatch(
        setIsLoading({
          value: false,
          message: 'Moved group successfully',
          type: 'success',
        })
      );

      dispatch(
        setIsDragDisabled({
          value: false,
          sourceDroppableId: '',
          destinationDroppableId: '',
        })
      );
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

  return (!isGuest && !user) || isFetching ? (
    <div className='fixed top-0 left-0 w-screen h-screen flex items-center justify-center'>
      <Loader2 size={24} className='animate-spin' />
    </div>
  ) : (
    <div className='flex justify-center pb-20 pt-4 sm:pt-8'>
      <div className='grow'>
        <DragDropContext onDragEnd={handleDragEnd}>
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
