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
import type { Workspace } from '@prisma/client';

const Navbar = () => {
  const [popOverOpen, setPopOverOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>();
  const [isRenaming, setIsRenaming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkspaces = async () => {
    const workspaces = await fetch('/api/workspace').then((res) => res.json());
    setWorkspaces(workspaces);
    setCurrentWorkspace(workspaces[0]);
  };

  const handleWorkspaceChange = async (id: string) => {
    if (currentWorkspace && id === currentWorkspace.id) return;

    const updatedWorkspace = await fetch(`/api/workspace/${id}`).then((res) =>
      res.json()
    );

    if (!updatedWorkspace) {
      console.error('Failed to select workspace');
      throw new Error('Failed to select workspace');
    }

    setPopOverOpen(false);
    setCurrentWorkspace(updatedWorkspace);
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
          id: currentWorkspace?.id || '',
          name: value,
        }),
      }).then((res) => res.json());
      setCurrentWorkspace(updatedWorkspace);

      await fetchWorkspaces();

      setIsLoading(false);
    }

    setIsRenaming(type === 'edit');
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (currentWorkspace) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [currentWorkspace]);

  return (
    <NavigationMenu className='fixed bottom-0 w-full flex justify-center'>
      <div className='grow max-w-[1200px]'>
        <NavigationMenuList className='gap-2 border border-input p-2 m-2 rounded-lg justify-between items-center'>
          <div className='flex gap-2 items-center'>
            <NavigationMenuItem>
              <Button className='gap-2' variant='secondary'>
                <Plus size={16} /> Add group
              </Button>
            </NavigationMenuItem>
          </div>

          <NavigationMenuItem>
            {currentWorkspace && !isLoading && (
              <div className='flex items-center gap-4'>
                <TitleEditor
                  title={currentWorkspace.name}
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
                      {workspaces.map((workspace) => (
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

export default Navbar;
