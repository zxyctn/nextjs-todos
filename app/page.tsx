'use client';

import { useEffect } from 'react';
import { DragDropContext, type DropResult } from 'react-beautiful-dnd';

import ReduxProvider from '@/store/redux-provider';
import TaskGroup from '@/components/task-group';
import { useAppSelector, useAppDispatch } from '@/store/store';
import {
  GroupWithOrderedTasks,
  setOrderedTasks,
  setWorkspaces,
} from '@/store/workspaceSlice';
import type { Group } from '@prisma/client';
import type { WorkspaceWithGroups } from '@/lib/prisma';

const Home = () => {
  const workspaceState = useAppSelector((state) => state.workspace);
  const dispatch = useAppDispatch();

  const fetchWorkspaces = async () => {
    const workspaces: WorkspaceWithGroups[] = await fetch(
      '/api/workspace'
    ).then((res) => res.json());

    if (!workspaces.length) {
      return;
    }

    dispatch(setWorkspaces(workspaces));
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }
    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;

    const sourceGroup = workspaceState.current.groups.find(
      (group: Group) => +group.id === sInd
    );

    const destinationGroup = workspaceState.current.groups.find(
      (group: Group) => +group.id === dInd
    );

    if (!sourceGroup || !destinationGroup) {
      throw new Error('Group not found');
    }

    if (sInd === dInd) {
      const newTaskOrder = Array.from(sourceGroup.taskOrder);
      newTaskOrder.splice(source.index, 1);
      newTaskOrder.splice(destination.index, 0, +result.draggableId);

      dispatch(
        setOrderedTasks({
          id: sourceGroup.id,
          taskOrder: newTaskOrder as number[],
        })
      );

      await fetch(`/api/group/${sInd}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskOrder: newTaskOrder,
        }),
      });

      await fetchWorkspaces();
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  return (
    <div className='flex justify-center grow'>
      <div className='grow'>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className='flex gap-32'>
            {workspaceState.current.orderedGroups.map(
              (group: GroupWithOrderedTasks) => (
                <TaskGroup key={group.id} groupId={group.id} />
              )
            )}
          </div>
        </DragDropContext>
      </div>
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
