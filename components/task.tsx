'use client';

import React, { useState } from 'react';
import { Trash } from 'lucide-react';

import EditTask from '@/components/edit-task';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { TaskWithActivities } from '@/lib/prisma';

const Task = ({
  task,
  groupName,
}: {
  task: TaskWithActivities;
  groupName: string;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
  };

  return (
    <>
      <Card className='bg-accent'>
        <CardHeader
          onClick={() => handleDialogOpenChange(true)}
          className='cursor-pointer'
        >
          <CardTitle>{task.title}</CardTitle>
          <CardDescription className='break-all'>
            {task.description}
          </CardDescription>
        </CardHeader>
        <CardFooter className='p-0 justify-end'>
          <Button size='icon' variant='ghost' className=''>
            <Trash size={16} />
          </Button>
        </CardFooter>
      </Card>

      <EditTask
        task={task}
        groupName={groupName}
        open={isDialogOpen}
        handleDialogOpenChange={handleDialogOpenChange}
      />
    </>
  );
};

export default Task;
