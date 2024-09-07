'use client';

import React, { useState } from 'react';
import { GripHorizontal, GripVertical, Trash, Waves } from 'lucide-react';
import { Droppable } from 'react-beautiful-dnd';

import TitleEditor from '@/components/title-editor';
import Task from '@/components/task';
import AddTask from '@/components/add-task';
import { useAppSelector } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { TaskWithActivities } from '@/lib/prisma';
import { cn } from '@/lib/utils';

const TaskGroup = ({ groupId }: { groupId: string }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [mouseOver, setMouseOver] = useState(false);

  const currentGroup = useAppSelector((state) =>
    state.workspace.current.orderedGroups.find((g) => g.id === groupId)
  );

  if (!currentGroup) return null;

  const handleMouseEvent = (value: boolean) => {
    setMouseOver(value);
  };

  const handleTitleEditing = async (
    type: 'save' | 'cancel' | 'edit',
    value: string = ''
  ) => {
    if (type === 'save') {
      //   setIsLoading(true);
      /* saving new name for the group */
      // setIsLoading(false);
    }

    setIsRenaming(type === 'edit');
  };

  return (
    <div className='flex flex-col gap-4 w-[300px]'>
      <div className='flex gap-2 justify-between w-full'>
        <div className='overflow-auto grow'>
          <TitleEditor
            size='2xl'
            title={currentGroup.name}
            handleEditingChange={handleTitleEditing}
          />
        </div>

        {!isRenaming && (
          <div className='flex gap-1'>
            <Button size='icon' variant='outline'>
              <Trash size={16} />
            </Button>
            <AddTask groupId={currentGroup.id} groupName={currentGroup.name} />
          </div>
        )}
      </div>

      <Droppable droppableId={groupId}>
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
                'absolute -top-3 flex justify-center w-full transition-opacity',
                {
                  'opacity-0': !mouseOver,
                }
              )}
            >
              <div className='rounded-md bg-accent border p-1 px-2 flex items-center justify-center'>
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
  );
};

export default TaskGroup;
