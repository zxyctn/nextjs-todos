'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Trash, Waves } from 'lucide-react';

import TitleEditor from '@/components/title-editor';
import Task from '@/components/task';
import AddTask from '@/components/add-task';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Group } from '@prisma/client';
import type { GroupWithTasks, TaskWithActivities } from '@/lib/prisma';

const TaskGroup = ({ group }: { group: GroupWithTasks }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<Group>(group);
  const [isLoading, setIsLoading] = useState(true);

  const handleTitleEditing = async (
    type: 'save' | 'cancel' | 'edit',
    value: string = ''
  ) => {
    if (type === 'save') {
      setIsLoading(true);

      /* saving new name for the group */

      setIsLoading(false);
    }

    setIsRenaming(type === 'edit');
  };

  useEffect(() => {
    if (currentGroup) setIsLoading(false);
  }, [currentGroup]);

  return isLoading ? (
    <Loader2 className='animate-spin' />
  ) : (
    <div className='flex flex-col gap-4 w-[300px]'>
      <div className='flex gap-2 justify-between w-full'>
        <div className='overflow-auto grow'>
          <TitleEditor
            size='2xl'
            title={group.name}
            handleEditingChange={handleTitleEditing}
          />
        </div>

        {!isRenaming && (
          <div className='flex gap-1'>
            <Button size='icon' variant='outline'>
              <Trash size={16} />
            </Button>
            <AddTask group={group} />
          </div>
        )}
      </div>

      <Card className='rounded-xl min-h-[100px]'>
        <CardContent className='p-4 h-full flex justify-center items-center'>
          {group.tasks.length === 0 ? (
            <div className='flex flex-col gap-2 items-center justify-center text-muted-foreground'>
              <Waves />
              <span className='text-xs'>No tasks in this group</span>
            </div>
          ) : (
            <div className='flex flex-col gap-2 w-full'>
              {group.tasks.map((task: TaskWithActivities) => (
                <Task task={task} groupName={group.name} key={task.id} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskGroup;
