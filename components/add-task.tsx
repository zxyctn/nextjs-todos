'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';

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
import { useAppDispatch } from '@/store/store';
import {
  createTask,
  setIsDragDisabled,
  setIsLoading,
} from '@/store/workspaceSlice';

const AddTask = ({
  groupId,
  groupName,
}: {
  groupId: string;
  groupName: string;
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('Untitled');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const dispatch = useAppDispatch();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (name === '') {
      toast.error('Task name cannot be empty');
      return;
    }

    dispatch(
      setIsDragDisabled({
        value: true,
        sourceDroppableId: groupId,
        destinationDroppableId: groupId,
      })
    );

    dispatch(
      setIsLoading({
        value: true,
        message: 'Creating task...',
        type: 'success',
      })
    );

    setIsSaving(true);

    const res = await fetch('/api/task', {
      method: 'POST',
      body: JSON.stringify({
        groupId,
        name,
        description,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    dispatch(
      setIsDragDisabled({
        value: false,
        sourceDroppableId: '',
        destinationDroppableId: '',
      })
    );

    setOpen(false);
    setIsSaving(false);

    if (res.ok) {
      const { task, activity } = await res.json();
      setName(task.name);
      setDescription(task.description);

      dispatch(
        createTask({
          id: task.id,
          groupId,
          name,
          description,
          activityId: activity.id,
          activityContent: activity.content,
        })
      );

      dispatch(
        setIsLoading({
          value: false,
          message: 'Task created successfully',
          type: 'success',
        })
      );
    } else {
      console.error('Failed creating task');

      dispatch(
        setIsLoading({
          value: false,
          message: 'Failed creating task',
          type: 'error',
        })
      );

      throw new Error('Failed creating task');
    }
  };

  const handleDialogOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger>
        <Button
          size='icon'
          variant='secondary'
          onClick={() => {
            open ? null : setOpen(true);
          }}
        >
          <Plus size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div className='overflow-auto max-h-[50vh] h-min'>
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
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type='button' variant='ghost'>
              Cancel
            </Button>
          </DialogClose>
          <Button type='submit' onClick={handleSubmit}>
            <div className='flex items-center justify-center'>
              {isSaving && <Loader2 className='mr-3 h-4 w-4 animate-spin' />}
              Save
            </div>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTask;
