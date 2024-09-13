'use client';

import React, { use, useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { GripVertical, Trash } from 'lucide-react';

import EditTask from '@/components/edit-task';
import Confirm from '@/components/confirm';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { TaskWithActivities } from '@/lib/prisma';
import { deleteTask, setIsLoading } from '@/store/workspaceSlice';

const Task = ({
  task,
  groupName,
  index,
}: {
  task: TaskWithActivities;
  groupName: string;
  index: number;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mouseOver, setMouseOver] = useState(false);

  const isGuest = useAppSelector((state) => state.workspace.isGuest);
  const isDragDisabled = useAppSelector(
    (state) => state.workspace.isDragDisabled.value
  );
  const dispatch = useAppDispatch();

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
  };

  const handleMouseEvent = (value: boolean) => {
    setMouseOver(value);
  };

  const handleTaskDelete = async () => {
    dispatch(
      setIsLoading({
        value: true,
        message: 'Deleting task...',
        type: 'success',
      })
    );

    if (!isGuest) {
      const res = await fetch(`/api/task/${task.id}`, {
        method: 'DELETE',
      });

      setIsDialogOpen(false);

      if (!res) {
        console.error('Failed deleting task');
        dispatch(
          setIsLoading({
            value: false,
            message: 'Failed deleting task',
            type: 'error',
          })
        );
        throw new Error('Failed deleting task');
      }
    }

    dispatch(deleteTask(task.id));

    dispatch(
      setIsLoading({
        value: false,
        message: 'Task deleted successfully',
        type: 'success',
      })
    );

    setIsDialogOpen(false);
  };

  return (
    <>
      <Draggable
        draggableId={`task-${task.id}`}
        index={index}
        isDragDisabled={isDragDisabled}
      >
        {(provided, snapshot) => (
          <Card
            {...provided.draggableProps}
            ref={provided.innerRef}
            className='bg-accent my-2'
            onMouseEnter={() => handleMouseEvent(true)}
            onMouseLeave={() => handleMouseEvent(false)}
          >
            <CardHeader
              onClick={() => handleDialogOpenChange(true)}
              className='cursor-pointer px-4 pb-0 pt-4 max-h-24'
            >
              <CardTitle className='text-base font-medium'>
                {task.name}
              </CardTitle>
              <CardDescription
                className={cn('relative overflow-hidden', {
                  'h-12': task.description,
                })}
              >
                <p className='text-sm'>{task.description}</p>
                <div className='absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-secondary to-transparent' />
              </CardDescription>
            </CardHeader>
            <CardFooter className='p-0 justify-between'>
              <div
                className='div h-10 w-10 flex items-center justify-center'
                {...provided.dragHandleProps}
              >
                <GripVertical
                  size={16}
                  className={cn('transition-opacity', {
                    'opacity-0': !mouseOver,
                  })}
                />
              </div>
              <Confirm
                onAction={handleTaskDelete}
                title='Delete task'
                description={`Are you sure you want to delete task ${task.name}?`}
              >
                <Button size='icon' variant='ghost'>
                  <Trash
                    size={16}
                    className={cn({
                      'opacity-0': !mouseOver,
                    })}
                  />
                </Button>
              </Confirm>
            </CardFooter>
          </Card>
        )}
      </Draggable>
      <EditTask
        task={task}
        groupName={groupName}
        open={isDialogOpen}
        handleDialogOpenChange={handleDialogOpenChange}
        handleDelete={handleTaskDelete}
      />
    </>
  );
};

export default Task;
