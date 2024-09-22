'use client';

import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  createGroup,
  setCurrentWorkspace,
  setIsLoading,
} from '@/store/workspaceSlice';
import { useAppDispatch, useAppSelector } from '@/store/store';

const CreateGroupButton = () => {
  const workspaces = useAppSelector((state) => state.workspace.workspaces);
  const currentWorkspace = useAppSelector((state) => state.workspace.current);
  const isGuest = useAppSelector((state) => state.auth.isGuest);
  const dispatch = useAppDispatch();

  const handleGroupCreate = async () => {
    dispatch(
      setIsLoading({
        value: true,
        message: 'Creating group...',
        type: 'success',
      })
    );

    if (isGuest) {
      dispatch(
        createGroup({
          id: `group_${+new Date()}`,
          name: 'New group',
        })
      );
    } else {
      const res = await fetch(`/api/group`, {
        method: 'POST',
        body: JSON.stringify({
          workspaceId: currentWorkspace?.id,
          name: 'New group',
        }),
      });

      if (!res.ok) {
        console.error('Failed creating group');
        dispatch(
          setIsLoading({
            value: false,
            message: 'Failed creating group',
            type: 'error',
          })
        );

        throw new Error('Failed creating group');
      }

      const { group, workspace } = await res.json();

      dispatch(
        createGroup({
          id: group.id,
          name: group.name,
        })
      );

      dispatch(setCurrentWorkspace(workspace));
    }

    dispatch(
      setIsLoading({
        value: false,
        message: 'Group created successfully',
        type: 'success',
      })
    );
  };

  return (
    <Button
      className='gap-2'
      variant='secondary'
      onClick={handleGroupCreate}
      disabled={workspaces.length === 0}
    >
      <Plus size={16} /> Add group
    </Button>
  );
};

export default CreateGroupButton;
