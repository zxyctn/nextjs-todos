'use client';

import { useState } from 'react';
import { ChevronUp, Plus, Trash } from 'lucide-react';

import TitleEditor from '@/components/title-editor';
import Confirm from '@/components/confirm';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  createWorkspace,
  deleteWorkspace,
  setCurrentWorkspace,
  setIsLoading,
  setWorkspaces,
  updateWorkspaceName,
} from '@/store/workspaceSlice';
import { useAppDispatch, useAppSelector } from '@/store/store';

const WorkspaceSelector = () => {
  const [popOverOpen, setPopOverOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);

  const workspaceState = useAppSelector((state) => state.workspace);
  const currentWorkspace = useAppSelector((state) => state.workspace.current);
  const isGuest = useAppSelector((state) => state.auth.isGuest);
  const dispatch = useAppDispatch();

  const handleWorkspaceChange = async (id: string) => {
    if (currentWorkspace && id === currentWorkspace.id) return;

    let workspaces = workspaceState.workspaces;
    let selected = workspaceState.current;

    dispatch(
      setIsLoading({
        value: true,
        message: 'Loading workspace...',
        type: 'success',
      })
    );

    setPopOverOpen(false);

    if (isGuest) {
      const workspace = workspaces.find((workspace) => workspace.id === id);

      if (!workspace) {
        console.error('Failed loading workspace');
        dispatch(
          setIsLoading({
            value: false,
            message: 'Failed loading workspace',
            type: 'error',
          })
        );
        throw new Error('Failed loading workspace');
      }

      dispatch(setCurrentWorkspace(workspace));
    } else {
      const res = await fetch(`/api/workspace/${id}`);

      if (!res) {
        console.error('Failed loading workspace');
        dispatch(
          setIsLoading({
            value: false,
            message: 'Failed loading workspace',
            type: 'error',
          })
        );
        throw new Error('Failed loading workspace');
      }

      const data = await res.json();

      workspaces = data.workspaces;
      selected = data.selected;

      dispatch(setWorkspaces(workspaces));
      dispatch(setCurrentWorkspace(selected));
    }

    dispatch(
      setIsLoading({
        value: false,
        message: 'Workspace loaded successfully',
        type: 'success',
      })
    );
  };

  const handleWorkspaceEditing = async (
    type: 'save' | 'cancel' | 'edit',
    value: string = ''
  ) => {
    if (type === 'save') {
      dispatch(
        setIsLoading({
          value: true,
          message: 'Updating workspace...',
          type: 'success',
        })
      );

      if (isGuest) {
        dispatch(
          updateWorkspaceName({
            id: currentWorkspace.id,
            name: value,
          })
        );
      } else {
        const res = await fetch(`/api/workspace/${currentWorkspace.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            id: currentWorkspace?.id || '',
            name: value,
          }),
        });

        if (!res.ok) {
          console.error('Failed updating workspace name');
          dispatch(
            setIsLoading({
              value: false,
              message: 'Failed updating workspace',
              type: 'error',
            })
          );
          throw new Error('Failed updating workspace name');
        }

        const updatedWorkspace = await res.json();

        dispatch(
          setWorkspaces(
            workspaceState.workspaces.map((workspace) =>
              workspace.id === updatedWorkspace.id
                ? updatedWorkspace
                : workspace
            )
          )
        );
        dispatch(setCurrentWorkspace(updatedWorkspace));
      }

      dispatch(
        setIsLoading({
          value: false,
          message: 'Workspace updated successfully',
          type: 'success',
        })
      );
    }

    setIsRenaming(type === 'edit');
  };

  const handleWorkspaceCreate = async () => {
    dispatch(
      setIsLoading({
        value: true,
        message: 'Creating workspace...',
        type: 'success',
      })
    );

    if (isGuest) {
      dispatch(
        createWorkspace({
          id: `workspace_${+new Date()}`,
          name: 'New workspace',
        })
      );
    } else {
      const res = await fetch(`/api/workspace`, {
        method: 'POST',
        body: JSON.stringify({
          name: 'New workspace',
        }),
      });

      if (!res) {
        console.error('Failed creating workspace');
        dispatch(
          setIsLoading({
            value: false,
            message: 'Failed creating workspace',
            type: 'error',
          })
        );
        throw new Error('Failed creating workspace');
      }

      const { workspaces, selected } = await res.json();

      dispatch(setWorkspaces(workspaces));
      dispatch(setCurrentWorkspace(selected));
    }

    dispatch(
      setIsLoading({
        value: false,
        message: 'Workspace created successfully',
        type: 'success',
      })
    );
  };

  const handleDeleteWorkspace = async (id: string) => {
    dispatch(
      setIsLoading({
        value: true,
        message: 'Deleting workspace...',
        type: 'success',
      })
    );

    if (isGuest) {
      dispatch(deleteWorkspace(id));
    } else {
      const res = await fetch(`/api/workspace/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        console.error('Failed deleting workspace', res);
        dispatch(
          setIsLoading({
            value: false,
            message: 'Failed deleting workspace',
            type: 'error',
          })
        );
        throw new Error('Failed deleting workspace');
      }

      const { workspaces, selected } = await res.json();

      dispatch(setWorkspaces(workspaces));
      dispatch(setCurrentWorkspace(selected));
    }

    dispatch(
      setIsLoading({
        value: false,
        message: 'Workspace deleted successfully',
        type: 'success',
      })
    );
  };

  return (
    <>
      {currentWorkspace && workspaceState.workspaces.length > 0 && (
        <div className='flex items-center gap-4 grow sm:grow-0'>
          <TitleEditor
            name={currentWorkspace.name}
            handleEditingChange={handleWorkspaceEditing}
            disabled={workspaceState.isLoading.value}
          />
          {!isRenaming && (
            <Popover
              onOpenChange={(open) => setPopOverOpen(open)}
              open={popOverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  size='icon'
                  variant='ghost'
                  className='rounded-full'
                  disabled={workspaceState.isLoading.value}
                >
                  <ChevronUp
                    className={`transition-transform ${
                      popOverOpen ? 'rotate-180' : ''
                    }`}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='p-2 space-y-2'>
                <Button
                  className='w-full justify-start'
                  onClick={handleWorkspaceCreate}
                >
                  <div className='flex gap-2 items-center'>
                    <Plus size={16} /> Create new workspace
                  </div>
                </Button>
                {workspaceState.workspaces.map((workspace) => (
                  <div
                    className='flex gap-1 items-center justify-between'
                    key={workspace.id}
                  >
                    <Button
                      className={cn('w-full justify-start', {
                        'cursor-default': workspace.id === currentWorkspace.id,
                      })}
                      key={workspace.id}
                      onClick={() =>
                        workspace.id !== currentWorkspace?.id
                          ? handleWorkspaceChange(workspace.id)
                          : null
                      }
                      variant={
                        workspace.id === currentWorkspace.id
                          ? 'secondary'
                          : 'ghost'
                      }
                    >
                      {workspace.name}
                    </Button>

                    <Confirm
                      onAction={async () =>
                        await handleDeleteWorkspace(workspace.id)
                      }
                      title='Delete workspace'
                      description={`Are you sure you want to delete workspace ${workspace.name}?`}
                    >
                      <Button size='icon' variant='ghost'>
                        <Trash size={12} />
                      </Button>
                    </Confirm>
                  </div>
                ))}
              </PopoverContent>
            </Popover>
          )}
        </div>
      )}

      {workspaceState.workspaces.length === 0 && (
        <Button onClick={handleWorkspaceCreate}>
          <div className='flex gap-2 items-center'>
            <Plus size={16} /> Create new workspace
          </div>
        </Button>
      )}
    </>
  );
};

export default WorkspaceSelector;
