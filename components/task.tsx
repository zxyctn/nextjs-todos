'use client';

import React from 'react';
import { Trash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const Task = ({ task }: { task: any }) => {
  return (
    <Card className='bg-accent'>
      <CardHeader>
        <CardTitle>{task.title}</CardTitle>
        <CardDescription className='break-all'>{task.description}</CardDescription>
      </CardHeader>
      <CardFooter className='relative p-0 justify-end'>
        <Button size='icon' variant='ghost' className='absolute bottom-0 right-0'>
          <Trash size={16} />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Task;
