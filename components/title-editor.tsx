'use client';

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X } from 'lucide-react';

const TitleEditor = ({
  title,
  handleEditingChange,
}: {
  title: string;
  handleEditingChange: (
    type: 'save' | 'cancel' | 'edit',
    value?: string
  ) => void;
}) => {
  const [value, setValue] = useState(title);
  const [isEditing, setIsEditing] = useState(false);

  const handleEditing = () => {
    handleEditingChange('edit');
    setIsEditing(true);
  };

  const handleSave = () => {
    handleEditingChange('save', value);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(title);
    setIsEditing(false);
    handleEditingChange('cancel');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return isEditing ? (
    <div className='flex gap-2'>
      <Input
        type='text'
        placeholder='Title'
        value={value}
        onChange={handleChange}
      />
      <div className='flex gap-1'>
        <Button onClick={handleCancel} size='icon' variant='outline'>
          <X size={16} />
        </Button>
        <Button onClick={handleSave} size='icon'>
          <Check size={16} />
        </Button>
      </div>
    </div>
  ) : (
    <Button
      className='text-lg font-medium'
      variant='ghost'
      onClick={handleEditing}
    >
      {title}
    </Button>
  );
};

export default TitleEditor;
