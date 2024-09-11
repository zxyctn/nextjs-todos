'use client';

import React, { use, useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { GripVertical, Trash } from 'lucide-react';

import EditTask from '@/components/edit-task';
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
import { deleteTask } from '@/store/workspaceSlice';

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

  const dispatch = useAppDispatch();

  const isDragDisabled = useAppSelector(
    (state) => state.workspace.isDragDisabled.value
  );

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
  };

  const handleMouseEvent = (value: boolean) => {
    setMouseOver(value);
  };

  const handleTaskDelete = async () => {
    const res = await fetch(`/api/task/${task.id}`, {
      method: 'DELETE',
    });

    if (!res) {
      console.error('Failed to delete task');
      throw new Error('Failed to delete task');
    }

    dispatch(deleteTask(task.id));

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
              className='cursor-pointer'
            >
              <CardTitle>{task.name}</CardTitle>
              <CardDescription className='break-all'>
                {task.description}
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

              <Button
                size='icon'
                variant='ghost'
                className=''
                onClick={handleTaskDelete}
              >
                <Trash size={16} />
              </Button>
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
