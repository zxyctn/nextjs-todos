'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Plus, Waves } from 'lucide-react';

import TitleEditor from '@/components/title-editor';
import Task from '@/components/task';
import { Button } from '@/components/ui/button';
import type { Group } from '@prisma/client';
import { Card, CardContent } from './ui/card';

const TaskGroup = ({ group }: { group: any }) => {
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
    <div className='flex flex-col gap-4 w-[350px]'>
      <div className='flex gap-2 justify-between w-full'>
        <div className='grow'>
          <TitleEditor
            size='2xl'
            title={group.name}
            handleEditingChange={handleTitleEditing}
          />
        </div>

        {!isRenaming && (
          <Button size='icon' variant='secondary'>
            <Plus size={16} />
          </Button>
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
              {group.tasks.map((task: any) => (
                <Task task={task} key={task.id} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskGroup;
