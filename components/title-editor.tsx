'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const TitleEditor = ({
  name,
  size = 'lg',
  disabled = false,
  handleEditingChange,
}: {
  name: string;
  size?: '2xl' | 'xl' | 'lg';
  disabled?: boolean;
  handleEditingChange: (
    type: 'save' | 'cancel' | 'edit',
    value?: string
  ) => void;
}) => {
  const [value, setValue] = useState(name);
  const [isEditing, setIsEditing] = useState(false);

  const handleEditing = () => {
    handleEditingChange('edit');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (value === '') {
      toast.error('Title cannot be empty');
      return;
    }

    handleEditingChange('save', value);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(name);
    setIsEditing(false);
    handleEditingChange('cancel');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return isEditing ? (
    <div className='flex gap-2 grow sm:grow-0'>
      <Input
        type='text'
        placeholder='Title'
        value={value}
        onChange={handleChange}
        disabled={disabled}
      />
      <div className='flex gap-1'>
        <Button
          onClick={handleCancel}
          size='icon'
          variant='outline'
          disabled={disabled}
        >
          <X size={16} />
        </Button>
        <Button onClick={handleSave} size='icon' disabled={disabled}>
          <Check size={16} />
        </Button>
      </div>
    </div>
  ) : (
    <Button
      className={cn('font-semibold justify-start p-0 grow sm:grow-0', {
        'text-2xl': size === '2xl',
        'text-xl': size === 'xl',
        'text-lg': size === 'lg',
      })}
      variant='link'
      onClick={handleEditing}
      disabled={disabled}
    >
      {name}
    </Button>
  );
};

export default TitleEditor;
