'use client';

import React, { useEffect, useState } from 'react';
import { ChevronUp, Loader2, LogOut, Plus, PlusIcon } from 'lucide-react';

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

    const updatedWorkspace = await fetch(`/api/workspace/${id}`).then((res) =>
      res.json()
    );

    if (!updatedWorkspace) {
      console.error('Failed to select workspace');
      throw new Error('Failed to select workspace');
    }

    dispatch(setCurrentWorkspace(updatedWorkspace));
    setPopOverOpen(false);

    dispatch(setIsLoading(false));
  };

  const handleWorkspaceEditing = async (
    type: 'save' | 'cancel' | 'edit',
    value: string = ''
  ) => {
    if (type === 'save') {
      dispatch(setIsLoading(true));

      const updatedWorkspace = await fetch(`/api/workspace`, {
        method: 'PUT',
        body: JSON.stringify({
          id: currentWorkspace?.id || '',
          name: value,
        }),
      }).then((res) => res.json());

      dispatch(
        setWorkspaces(
          workspaceState.workspaces.map((workspace) =>
            workspace.id === updatedWorkspace.id ? updatedWorkspace : workspace
          )
        )
      );

      dispatch(setIsLoading(false));
    }

    setIsRenaming(type === 'edit');
  };

  const handleWorkspaceCreate = async () => {
    dispatch(setIsLoading(true));

    await fetch(`/api/workspace`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'New workspace',
      }),
    }).then((res) => res.json());

    const workspaces = await fetch(`/api/workspace`).then((res) => res.json());
    dispatch(setWorkspaces(workspaces));

    dispatch(setIsLoading(false));
  };

  return (
    <NavigationMenu className='fixed bottom-0 w-full flex justify-center'>
      <div className='grow max-w-[1400px]'>
        <NavigationMenuList className='gap-2 border border-input p-2 m-2 rounded-lg justify-between items-center'>
          <div className='flex gap-2 items-center'>
            <NavigationMenuItem>
              <Button className='gap-2' variant='secondary'>
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
