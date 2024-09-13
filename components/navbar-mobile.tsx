'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronUp, LogOut, Menu, Plus, PlusIcon, Trash } from 'lucide-react';

import TitleEditor from '@/components/title-editor';
import Confirm from '@/components/confirm';
import { cn } from '@/lib/utils';
import { LightSwitch } from '@/components/light-switch';
import { Separator } from '@/components/ui/separator';
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
  createWorkspace,
  deleteWorkspace,
  setCurrentWorkspace,
  setIsLoading,
  setWorkspaces,
  updateWorkspaceName,
} from '@/store/workspaceSlice';
import ReduxProvider from '@/store/redux-provider';

const NavbarMobile = () => {
  const [popOverOpen, setPopOverOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const workspaceState = useAppSelector((state) => state.workspace);
  const currentWorkspace = useAppSelector((state) => state.workspace.current);
  const isGuest = useAppSelector((state) => state.workspace.isGuest);
  const dispatch = useAppDispatch();

  const navRef = useRef(null);

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

  const handleClickOutside = (e: MouseEvent) => {
    if (navRef.current) {
      const current = navRef.current as HTMLElement;
      const rect = current.getBoundingClientRect();
      const { clientX: x, clientY: y } = e;
      // Check if the click is outside the navbar boundaries
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        setTimeout(() => {
          setIsMenuOpen(false); // Collapse navbar
        }, 300);
      }
    }
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <NavigationMenu
      ref={navRef}
      className='fixed bottom-0 w-full flex flex-col sm:hidden justify-center transition-all p-2 m-2'
    >
      <div
        className={cn(
          'bg-primary/10 backdrop-blur-lg rounded-lg w-full grow p-2 flex flex-col',
          { 'gap-2': isMenuOpen }
        )}
      >
        <NavigationMenuList
          className={cn('sm:gap-2 items-center justify-between', {
            hidden: !isMenuOpen,
          })}
        >
          <NavigationMenuItem className='sm:gap-2 items-center sm:hidden flex'>
            <Button
              className='gap-2'
              variant='secondary'
              onClick={handleGroupCreate}
            >
              <Plus size={16} /> Add group
            </Button>
          </NavigationMenuItem>

          <NavigationMenuList className='gap-1 items-center'>
            <NavigationMenuItem>
              <LightSwitch />
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Button size='icon'>
                <LogOut size={16} />
              </Button>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenuList>
        <Separator
          className={cn('my-2 bg-primary/5', {
            hidden: !isMenuOpen,
          })}
        />
        <NavigationMenuList className='gap-2 justify-between items-center'>
          <NavigationMenuItem>
            <Button
              size='icon'
              variant='ghost'
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
              }}
            >
              <Menu size={16} />
            </Button>
          </NavigationMenuItem>
          {currentWorkspace && workspaceState.workspaces.length > 0 && (
            <NavigationMenuItem className='flex items-center gap-4 grow sm:grow-0'>
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
            </NavigationMenuItem>
          )}

          {workspaceState.workspaces.length === 0 && (
            <Button onClick={handleWorkspaceCreate}>
              <div className='flex gap-2 items-center'>
                <PlusIcon size={16} /> Create new workspace
              </div>
            </Button>
          )}
        </NavigationMenuList>
      </div>
    </NavigationMenu>
  );
};

const NavbarWrapper = () => {
  return (
    <ReduxProvider>
      <NavbarMobile />
    </ReduxProvider>
  );
};

export default NavbarWrapper;
