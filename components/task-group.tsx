'use client';

import React, { useState } from 'react';
import { GripHorizontal, Trash, Waves } from 'lucide-react';
import { Draggable, Droppable } from '@hello-pangea/dnd';

import TitleEditor from '@/components/title-editor';
import Task from '@/components/task';
import AddTask from '@/components/add-task';
import Confirm from '@/components/confirm';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/store';
import {
  updateGroupName,
  setIsDragDisabled,
  deleteGroup,
  setIsLoading,
} from '@/store/workspaceSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { TaskWithActivities } from '@/lib/prisma';

const TaskGroup = ({ groupId, index }: { groupId: string; index: number }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [mouseOver, setMouseOver] = useState(false);

  const dispatch = useAppDispatch();
  const isGuest = useAppSelector((state) => state.workspace.isGuest);

  const currentGroup = useAppSelector((state) =>
    state.workspace.current.orderedGroups.find((g) => g.id === groupId)
  );
  const isDragDisabled = useAppSelector(
    (state) => state.workspace.isDragDisabled
  );

  if (!currentGroup) return null;

  const handleMouseEvent = (value: boolean) => {
    setMouseOver(value);
  };

  const handleNameEditing = async (
    type: 'save' | 'cancel' | 'edit',
    value: string = ''
  ) => {
    setIsRenaming(type === 'edit');
    if (type === 'save') {
      const currentGroupName = currentGroup.name;

      dispatch(
        setIsLoading({
          value: true,
          message: 'Updating group name...',
          type: 'success',
        })
      );

      dispatch(updateGroupName({ id: groupId, name: value }));

      if (!isGuest) {
        dispatch(
          setIsDragDisabled({
            value: true,
            sourceDroppableId: groupId,
            destinationDroppableId: '',
          })
        );

        const res = await fetch(`/api/group/${groupId}`, {
          method: 'PATCH',
          body: JSON.stringify({ name: value }),
        });

        dispatch(
          setIsDragDisabled({
            value: false,
            sourceDroppableId: '',
            destinationDroppableId: '',
          })
        );

        if (!res.ok) {
          console.error('Failed updating group name');
          dispatch(
            setIsLoading({
              value: false,
              message: 'Failed updating group name',
              type: 'error',
            })
          );
          dispatch(updateGroupName({ id: groupId, name: currentGroupName }));
          throw new Error('Failed updating group name');
        }
      }

      dispatch(
        setIsLoading({
          value: false,
          message: 'Group name updated successfully',
          type: 'success',
        })
      );
    }
  };

  const handleGroupDelete = async () => {
    dispatch(
      setIsLoading({
        value: true,
        message: 'Deleting group...',
        type: 'success',
      })
    );

    if (!isGuest) {
      dispatch(
        setIsDragDisabled({
          value: true,
          sourceDroppableId: groupId,
          destinationDroppableId: '',
        })
      );

      const res = await fetch(`/api/group/${groupId}`, {
        method: 'DELETE',
      });

      dispatch(
        setIsDragDisabled({
          value: false,
          sourceDroppableId: '',
          destinationDroppableId: '',
        })
      );

      if (!res.ok) {
        console.error('Failed deleting group');

        dispatch(
          setIsLoading({
            value: false,
            message: 'Failed deleting group',
            type: 'error',
          })
        );

        throw new Error('Failed deleting group');
      }
    }

    dispatch(deleteGroup(groupId));
    dispatch(
      setIsLoading({
        value: false,
        message: 'Group deleted successfully',
        type: 'success',
      })
    );
  };

  return (
    <Draggable
      draggableId={`group-${groupId}`}
      index={index}
      isDragDisabled={
        isDragDisabled.sourceDroppableId === 'workspace' ||
        isDragDisabled.destinationDroppableId === currentGroup.id ||
        isDragDisabled.sourceDroppableId === currentGroup.id
      }
    >
      {(providedDraggable) => (
        <div
          className='flex flex-col gap-4 w-[300px] sm:mx-16 mx-8'
          ref={providedDraggable.innerRef}
          {...providedDraggable.draggableProps}
        >
          <div className='flex gap-2 justify-between w-full'>
            <div className='overflow-auto grow'>
              <TitleEditor
                size='2xl'
                name={currentGroup.name}
                handleEditingChange={handleNameEditing}
                disabled={
                  isDragDisabled.sourceDroppableId === currentGroup.id ||
                  isDragDisabled.destinationDroppableId === currentGroup.id ||
                  isDragDisabled.sourceDroppableId === 'workspace'
                }
              />
            </div>

            {!isRenaming && (
              <div className='flex gap-1'>
                <Confirm
                  onAction={handleGroupDelete}
                  title='Delete group'
                  description={`Are you sure you want to delete group ${currentGroup.name}?`}
                >
                  <Button size='icon' variant='outline'>
                    <Trash size={16} />
                  </Button>
                </Confirm>
                <AddTask
                  groupId={currentGroup.id}
                  groupName={currentGroup.name}
                />
              </div>
            )}
          </div>

          <Droppable
            droppableId={`group-${groupId}`}
            type='task'
            isDropDisabled={
              isDragDisabled.sourceDroppableId === 'workspace' ||
              isDragDisabled.destinationDroppableId === currentGroup.id ||
              isDragDisabled.sourceDroppableId === currentGroup.id
            }
          >
            {(provided, snapshot) => (
              <Card
                className={cn(
                  'relative rounded-xl min-h-[100px] flex items-center transition-colors duration-200',
                  {
                    'bg-accent/40': snapshot.isDraggingOver,
                  }
                )}
                onMouseEnter={() => handleMouseEvent(true)}
                onMouseLeave={() => handleMouseEvent(false)}
              >
                <div
                  className={cn(
                    'absolute -top-3 flex justify-center z-40 w-full transition-opacity',
                    {
                      'opacity-0': !mouseOver,
                    }
                  )}
                >
                  <div
                    className='rounded-md bg-accent border p-1 px-2 flex items-center justify-center'
                    {...providedDraggable.dragHandleProps}
                  >
                    <GripHorizontal size={12} />
                  </div>
                </div>
                <CardContent
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className='p-4 py-2 h-full flex flex-col justify-center items-center grow'
                >
                  {currentGroup.tasks.length === 0 ? (
                    <div
                      className={cn(
                        'flex flex-col gap-2 items-center justify-center text-muted-foreground transition-opacity duration-0',
                        {
                          'opacity-0': snapshot.isDraggingOver,
                        }
                      )}
                    >
                      <Waves />
                      <span className='text-xs'>No tasks in this group</span>
                    </div>
                  ) : (
                    <div className='flex flex-col w-full'>
                      {currentGroup.orderedTasks.map(
                        (task: TaskWithActivities, index) => (
                          <Task
                            task={task}
                            groupName={currentGroup.name}
                            key={task.id}
                            index={index}
                          />
                        )
                      )}
                    </div>
                  )}
                  {provided.placeholder}
                </CardContent>
              </Card>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
};

export default TaskGroup;
