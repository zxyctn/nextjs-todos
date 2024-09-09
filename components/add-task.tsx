'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const AddTask = ({
  groupId,
  groupName,
}: {
  groupId: string;
  groupName: string;
}) => {
  const [name, setName] = useState('Untitled');
  const [description, setDescription] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(e.target.value);
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button size='icon' variant='secondary'>
          <Plus size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className='hidden'>Add task</DialogTitle>
        <div className='flex flex-col gap-8'>
          <div className='flex flex-col'>
            <div className='flex flex-col gap-2'>
              <Label
                htmlFor={`add-task-${groupId}`}
                className='text-lg font-semibold'
              >
                Title
              </Label>
              <Input
                id={`add-task-${groupId}`}
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
            <Label htmlFor='description'>Description</Label>
            <Textarea
              placeholder='Task description'
              id='description'
              onChange={handleDescriptionChange}
              value={description}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type='button' variant='ghost'>
              Cancel
            </Button>
          </DialogClose>
          <Button type='submit'>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTask;
