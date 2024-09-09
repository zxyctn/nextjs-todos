'use client';

import { useEffect } from 'react';
import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd';
import { Waves } from 'lucide-react';

import ReduxProvider from '@/store/redux-provider';
import TaskGroup from '@/components/task-group';
import { useAppSelector, useAppDispatch } from '@/store/store';
import {
  GroupWithOrderedTasks,
  setCurrentWorkspace,
  setIsDragDisabled,
  setIsLoading,
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
    const { source, destination, type } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }
    if (type === 'task') {
      const sInd = +source.droppableId.split('-')[1];
      const dInd = +destination.droppableId.split('-')[1];

      dispatch(
        setIsDragDisabled({
          value: true,
          sourceDroppableId: sInd,
          destinationDroppableId: dInd,
        })
      );

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
        newTaskOrder.splice(
          destination.index,
          0,
          +result.draggableId.split('-')[1]
        );

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
      } else {
        const taskId = +result.draggableId.split('-')[1];

        const newSourceTaskOrder = Array.from(sourceGroup.taskOrder);
        newSourceTaskOrder.splice(source.index, 1);

        const newDestinationTaskOrder = Array.from(destinationGroup.taskOrder);
        newDestinationTaskOrder.splice(destination.index, 0, taskId);

        await fetch(`/api/task/${taskId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            groupId: `${dInd}`,
          }),
        });

        await fetch(`/api/group/${sInd}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            taskOrder: newSourceTaskOrder,
          }),
        });

        await fetch(`/api/group/${dInd}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            taskOrder: newDestinationTaskOrder,
          }),
        });

        await fetchWorkspaces();

        dispatch(
          setOrderedTasks({
            id: sourceGroup.id,
            taskOrder: newSourceTaskOrder as number[],
          })
        );

        dispatch(
          setOrderedTasks({
            id: destinationGroup.id,
            taskOrder: newDestinationTaskOrder as number[],
          })
        );
      }

      dispatch(
        setIsDragDisabled({
          value: false,
          sourceDroppableId: -1,
          destinationDroppableId: -1,
        })
      );
    } else {
      const newGroupOrder = Array.from(workspaceState.current.groupOrder);
      newGroupOrder.splice(source.index, 1);
      newGroupOrder.splice(
        destination.index,
        0,
        +result.draggableId.split('-')[1]
      );

      dispatch(setIsLoading(true));

      dispatch(
        setCurrentWorkspace({
          ...workspaceState.current,
          groupOrder: newGroupOrder as number[],
        })
      );

      await fetch(`/api/workspace/${workspaceState.current.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupOrder: newGroupOrder,
        }),
      });

      await fetchWorkspaces();

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
