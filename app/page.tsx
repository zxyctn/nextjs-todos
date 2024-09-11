'use client';

import { useEffect } from 'react';
import { Waves } from 'lucide-react';
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

const Home = () => {
  const workspaceState = useAppSelector((state) => state.workspace);
  const dispatch = useAppDispatch();

  const fetchWorkspaces = async () => {
    const res = await fetch('/api/workspace');

    if (!res) {
      console.error('Failed to fetch workspaces');
      throw new Error('Failed to fetch workspaces');
    }

    const { workspaces, selected } = await res.json();

    if (!workspaces.length) {
      return;
    }

    dispatch(setWorkspaces(workspaces));
    dispatch(setCurrentWorkspace(selected));
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

      dispatch(
        setIsDragDisabled({
          value: true,
          sourceDroppableId: sInd,
          destinationDroppableId: dInd,
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

        throw new Error('Failed to move task');

        // TODO: Show a toast
      }

      const { task, activity } = await res.json();

      dispatch(
        updateTaskContent({
          taskId: task.id,
          name: task.name,
          description: task.description,
          activityId: activity.id,
          activityContent: activity.content,
        })
      );

      dispatch(
        setIsDragDisabled({
          value: false,
          sourceDroppableId: '',
          destinationDroppableId: '',
        })
      );
    } else {
      const groupId = result.draggableId.split('-')[1];

      dispatch(
        moveGroup({
          id: groupId,
          index: destination.index,
        })
      );

      dispatch(setIsLoading(true));

      await fetch(`/api/group/${groupId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          index: destination.index,
        }),
      });

      dispatch(setIsLoading(false));
    }
  };

  useEffect(() => {
    const init = async () => {
      dispatch(setIsLoading(true));
      await fetchWorkspaces();
      dispatch(setIsLoading(false));
    };

    init();
  }, []);

  return (
    <div className='flex justify-center grow'>
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
                  {workspaceState.current.orderedGroups.map(
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

      {workspaceState.current.groups.length === 0 && (
        <div className='fixed flex flex-col gap-2 items-center justify-center text-muted-foreground h-full w-full'>
          <Waves />
          <span className='text-xs'>No groups in this workspace</span>
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
