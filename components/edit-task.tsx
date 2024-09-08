'use client';

import React, { useState } from 'react';
import moment from 'moment';
import { Trash } from 'lucide-react';

import TitleEditor from '@/components/title-editor';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description || '');

  const handleTitleEditing = async (
    type: 'save' | 'cancel' | 'edit',
    value: string = ''
  ) => {
    if (type === 'save') {
      setName(value);
    }
    setIsEditingName(type === 'edit');
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(e.target.value);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className={cn({ hideX: isEditingName })}>
        <DialogTitle className='hidden'>Add task</DialogTitle>
        <div className='flex flex-col gap-8'>
          <div className='flex flex-col'>
            <TitleEditor
              name={name}
              size='2xl'
              handleEditingChange={handleTitleEditing}
            />
            <p className='text-xs pt-2'>
              In group <span className='font-bold'>{groupName}</span>
            </p>
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
            {task.activities.map((activity: Activity) => (
              <div className='flex flex-col' key={activity.id}>
                <div key={activity.id} className='text-sm italic'>
                  {activity.content}
                </div>
                <div className='text-xs text-muted-foreground'>
                  {moment(activity.createdAt).fromNow()}
                </div>
              </div>
            ))}
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
