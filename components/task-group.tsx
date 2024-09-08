'use client';

import React, { useState } from 'react';
import { GripHorizontal, Loader2, Trash, Waves } from 'lucide-react';
import { Draggable, Droppable } from '@hello-pangea/dnd';

import TitleEditor from '@/components/title-editor';
import Task from '@/components/task';
import AddTask from '@/components/add-task';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { TaskWithActivities } from '@/lib/prisma';

const TaskGroup = ({ groupId, index }: { groupId: string; index: number }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [mouseOver, setMouseOver] = useState(false);

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
    <Draggable draggableId={`group-${groupId}`} index={index}>
      {(providedDraggable) => (
        <div
          className='flex flex-col gap-4 w-[300px] mx-16'
          ref={providedDraggable.innerRef}
          {...providedDraggable.draggableProps}
        >
          <div className='flex gap-2 justify-between w-full'>
            <div className='overflow-auto grow'>
              <TitleEditor
                size='2xl'
                name={currentGroup.name}
                handleEditingChange={handleTitleEditing}
              />
            </div>

            {!isRenaming && (
              <div className='flex gap-1'>
                <Button size='icon' variant='outline'>
                  <Trash size={16} />
                </Button>
                <AddTask
                  groupId={currentGroup.id}
                  groupName={currentGroup.name}
                />
              </div>
            )}
          </div>

          <Droppable droppableId={`group-${groupId}`} type='task'>
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
                {(isDragDisabled.sourceDroppableId === +currentGroup.id ||
                  isDragDisabled.destinationDroppableId ===
                    +currentGroup.id) && (
                  <div className='z-30 w-full h-full absolute rounded-xl flex items-center justify-center backdrop-blur-sm'>
                    <Loader2 className='animate-spin' />
                  </div>
                )}

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
