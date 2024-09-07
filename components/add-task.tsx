'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';

import TitleEditor from '@/components/title-editor';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Group } from '@prisma/client';

const AddTask = ({
  groupId,
  groupName,
}: {
  groupId: string;
  groupName: string;
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState('Untitled');
  const [description, setDescription] = useState('');

  const handleTitleEditing = async (
    type: 'save' | 'cancel' | 'edit',
    value: string = ''
  ) => {
    if (type === 'save') {
      setTitle(value);
    }
    setIsEditingTitle(type === 'edit');
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
      <DialogContent className={cn({ hideX: isEditingTitle })}>
        <DialogTitle className='hidden'>Add task</DialogTitle>
        <div className='flex flex-col gap-8'>
          <div className='flex flex-col'>
            <TitleEditor
              title={title}
              size='2xl'
              handleEditingChange={handleTitleEditing}
            />
            <p className='text-xs pt-2'>
              In group <span className='font-bold'>{groupName}</span>
            </p>
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              placeholder='Task description'
              id='description'
              onChange={handleDescriptionChange}
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
