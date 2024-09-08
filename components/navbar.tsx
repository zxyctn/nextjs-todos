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
import { setCurrentWorkspace, setWorkspaces } from '@/store/workspaceSlice';
import ReduxProvider from '@/store/redux-provider';

const Navbar = () => {
  const [popOverOpen, setPopOverOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const workspaceState = useAppSelector((state) => state.workspace);
  const dispatch = useAppDispatch();

  const handleWorkspaceChange = async (id: string) => {
    if (workspaceState.current && id === workspaceState.current.id) return;

    const updatedWorkspace = await fetch(`/api/workspace/${id}`).then((res) =>
      res.json()
    );

    if (!updatedWorkspace) {
      console.error('Failed to select workspace');
      throw new Error('Failed to select workspace');
    }

    setPopOverOpen(false);
    dispatch(setCurrentWorkspace(updatedWorkspace));
  };

  const handleWorkspaceEditing = async (
    type: 'save' | 'cancel' | 'edit',
    value: string = ''
  ) => {
    if (type === 'save') {
      setIsLoading(true);

      const updatedWorkspace = await fetch(`/api/workspace`, {
        method: 'PUT',
        body: JSON.stringify({
          id: workspaceState.current?.id || '',
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

      setIsLoading(false);
    }

    setIsRenaming(type === 'edit');
  };

  useEffect(() => {
    if (workspaceState.current) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [workspaceState.current]);

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
            {workspaceState.current.name && !isLoading && (
              <div className='flex items-center gap-4'>
                <TitleEditor
                  name={workspaceState.current.name}
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
                      <Button className='w-full justify-start'>
                        <div className='flex gap-2 items-center'>
                          <PlusIcon size={16} /> Create new workspace
                        </div>
                      </Button>
                      {workspaceState.workspaces.map((workspace) => (
                        <Button
                          className={cn('w-full justify-start', {
                            'cursor-default':
                              workspace.id === workspaceState.current.id,
                          })}
                          key={workspace.id}
                          onClick={() =>
                            workspace.id !== workspaceState.current?.id
                              ? handleWorkspaceChange(workspace.id)
                              : null
                          }
                          variant={
                            workspace.id === workspaceState.current.id
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
            {isLoading && <Loader2 className='animate-spin' />}
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
