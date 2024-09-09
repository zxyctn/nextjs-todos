'use client';

import React, { useState } from 'react';
import moment from 'moment';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import type { Activity } from '@prisma/client';
import type { TaskWithActivities } from '@/lib/prisma';

const EditTask = ({
  task,
  groupName,
  open,
  handleDialogOpenChange,
}: {
  task: TaskWithActivities;
  groupName: string;
  open: boolean;
  handleDialogOpenChange: any;
}) => {
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description || '');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(e.target.value);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className='min-h overflow-auto'>
        <DialogTitle className='hidden'>Add task</DialogTitle>
        <div className='flex flex-col gap-8'>
          <div className='flex flex-col'>
            <div className='flex flex-col gap-2'>
              <Label
                htmlFor={`edit-task-${task.id}`}
                className='text-lg font-semibold'
              >
                Title
              </Label>
              <Input
                id={`edit-task-${task.id}`}
                type='text'
                className=''
                value={name}
                onChange={handleNameChange}
              />
              <p className='text-xs'>
                In group <span className='font-bold'>{groupName}</span>
              </p>
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='description' className='text-lg font-semibold'>
              Description
            </Label>
            <Textarea
              placeholder='Task description'
              id='description'
              value={description}
              onChange={handleDescriptionChange}
            />
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='activity' className='text-lg font-semibold'>
              Activity
            </Label>
            <div className='max-h-[200px] flex flex-col overflow-auto gap-2'>
              {task.activities.map((activity: Activity, index: number) => (
                <div className='flex flex-col' key={activity.id}>
                  <div className='flex gap-4'>
                    <div className='pt-2'>
                      <div className='size-2 bg-primary/20 rounded-full'></div>
                    </div>

                    <div className=''>
                      <div key={activity.id} className='text-sm'>
                        {activity.content}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        {moment(activity.createdAt).fromNow()}
                      </div>
                    </div>
                  </div>

                  {index !== task.activities.length - 1 && (
                    <div className='w-2 flex justify-center'>
                      <Separator
                        orientation='vertical'
                        className='h-8 -mt-1 bg-primary/20'
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className='w-full pt-4'>
          <div className='flex justify-between w-full gap-2'>
            <Button variant='destructive' className=''>
              Delete
            </Button>
            <div className='flex gap-2'>
              <DialogClose asChild>
                <Button type='button' variant='ghost'>
                  Cancel
                </Button>
              </DialogClose>
              <Button type='submit'>Save</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTask;
