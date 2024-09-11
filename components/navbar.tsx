'use client';

import React, { useEffect, useState } from 'react';
import {
  ChevronUp,
  Loader2,
  LogOut,
  Plus,
  PlusIcon,
  Trash,
} from 'lucide-react';

import TitleEditor from '@/components/title-editor';
import { cn } from '@/lib/utils';
import { LightSwitch } from '@/components/light-switch';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/store';
import {
  createGroup,
  setCurrentWorkspace,
  setIsLoading,
  setWorkspaces,
} from '@/store/workspaceSlice';
import ReduxProvider from '@/store/redux-provider';

const Navbar = () => {
  const [popOverOpen, setPopOverOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);

  const workspaceState = useAppSelector((state) => state.workspace);
  const currentWorkspace = useAppSelector((state) => state.workspace.current);
  const dispatch = useAppDispatch();

  const handleWorkspaceChange = async (id: string) => {
    if (currentWorkspace && id === currentWorkspace.id) return;

    dispatch(setIsLoading(true));

    const res = await fetch(`/api/workspace/${id}`);

    if (!res) {
      console.error('Failed to select workspace');
      throw new Error('Failed to select workspace');
    }

    const { workspaces, selected } = await res.json();

    dispatch(setWorkspaces(workspaces));
    dispatch(setCurrentWorkspace(selected));
    setPopOverOpen(false);

    dispatch(setIsLoading(false));
  };

  const handleWorkspaceEditing = async (
    type: 'save' | 'cancel' | 'edit',
    value: string = ''
  ) => {
    if (type === 'save') {
      dispatch(setIsLoading(true));

      const res = await fetch(`/api/workspace/${currentWorkspace.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          id: currentWorkspace?.id || '',
          name: value,
        }),
      });

      if (!res.ok) {
        console.error('Failed to update workspace name');
        dispatch(setIsLoading(false));
        return;
      }

      const updatedWorkspace = await res.json();

      dispatch(
        setWorkspaces(
          workspaceState.workspaces.map((workspace) =>
            workspace.id === updatedWorkspace.id ? updatedWorkspace : workspace
          )
        )
      );
      dispatch(setCurrentWorkspace(updatedWorkspace));

      dispatch(setIsLoading(false));
    }

    setIsRenaming(type === 'edit');
  };

  const handleWorkspaceCreate = async () => {
    dispatch(setIsLoading(true));

    const res = await fetch(`/api/workspace`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'New workspace',
      }),
    });

    if (!res) {
      console.error('Failed to create workspace');
      dispatch(setIsLoading(false));
      return;
    }

    const { workspaces, selected } = await res.json();

    dispatch(setWorkspaces(workspaces));
    dispatch(setCurrentWorkspace(selected));

    dispatch(setIsLoading(false));
  };

  const handleGroupCreate = async () => {
    dispatch(setIsLoading(true));

    const res = await fetch(`/api/group`, {
      method: 'POST',
      body: JSON.stringify({
        workspaceId: currentWorkspace?.id,
        name: 'New group',
      }),
    });

    if (!res.ok) {
      console.error('Failed to create group');
      dispatch(setIsLoading(false));
      return;
    }

    const { group, workspace } = await res.json();

    dispatch(
      createGroup({
        id: group.id,
        name: group.name,
      })
    );

    dispatch(setCurrentWorkspace(workspace));

    dispatch(setIsLoading(false));
  };

  const handleDeleteWorkspace = async (id: string) => {
    dispatch(setIsLoading(true));

    const res = await fetch(`/api/workspace/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      console.error('Failed to delete workspace', res);
      dispatch(setIsLoading(false));
      return;
    }

    const { workspaces, selected } = await res.json();

    dispatch(setWorkspaces(workspaces));
    dispatch(setCurrentWorkspace(selected));

    dispatch(setIsLoading(false));
  };

  return (
    <NavigationMenu className='fixed bottom-0 w-full flex justify-center'>
      <div className='grow max-w-[1400px]'>
        <NavigationMenuList className='gap-2 border border-input p-2 m-2 rounded-lg justify-between items-center'>
          <div className='flex gap-2 items-center'>
            <NavigationMenuItem>
              <Button
                className='gap-2'
                variant='secondary'
                onClick={handleGroupCreate}
              >
                <Plus size={16} /> Add group
              </Button>
            </NavigationMenuItem>
          </div>

          <NavigationMenuItem>
            {currentWorkspace && !workspaceState.isLoading && (
              <div className='flex items-center gap-4'>
                <TitleEditor
                  name={currentWorkspace.name}
                  handleEditingChange={handleWorkspaceEditing}
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
                          <PlusIcon size={16} /> Create new workspace
                        </div>
                      </Button>
                      {workspaceState.workspaces.map((workspace) => (
                        <div
                          className='flex gap-1 items-center justify-between'
                          key={workspace.id}
                        >
                          <Button
                            className={cn('w-full justify-start', {
                              'cursor-default':
                                workspace.id === currentWorkspace.id,
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

                          <Button
                            size='icon'
                            variant='ghost'
                            onClick={async () =>
                              await handleDeleteWorkspace(workspace.id)
                            }
                          >
                            <Trash size={12} />
                          </Button>
                        </div>
                      ))}
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            )}
            {workspaceState.isLoading && <Loader2 className='animate-spin' />}
          </NavigationMenuItem>

          <div className='flex gap-2 items-center'>
            <NavigationMenuItem>
              <LightSwitch />
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Button size='icon'>
                <LogOut size={16} />
              </Button>
            </NavigationMenuItem>
          </div>
        </NavigationMenuList>
      </div>
    </NavigationMenu>
  );
};

const NavbarWrapper = () => {
  return (
    <ReduxProvider>
      <Navbar />
    </ReduxProvider>
  );
};

export default NavbarWrapper;
