'use client';

import { useEffect, useRef, useState } from 'react';
import { Menu } from 'lucide-react';

import ReduxProvider from '@/store/redux-provider';
import CreateGroupButton from '@/components/create-group-button';
import WorkspaceSelector from '@/components/workspace-selector';
import AuthButton from '@/components/auth-button';
import { cn } from '@/lib/utils';
import { LightSwitch } from '@/components/light-switch';
import { Separator } from '@/components/ui/separator';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/store';

const NavbarMobile = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isGuest = useAppSelector((state) => state.auth.isGuest);
  const user = useAppSelector((state) => state.auth.user);

  const navRef = useRef(null);

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
      className={cn(
        'fixed bottom-0 w-full flex flex-col sm:hidden justify-center transition-all p-2 m-2',
        {
          hidden: !user && !isGuest,
        }
      )}
    >
      <div
        className={cn(
          'bg-background border border-input rounded-lg w-full grow p-2 flex flex-col',
          { 'gap-2': isMenuOpen }
        )}
      >
        <NavigationMenuList
          className={cn('sm:gap-2 items-center justify-between', {
            hidden: !isMenuOpen,
          })}
        >
          <NavigationMenuItem className='sm:gap-2 items-center sm:hidden flex'>
            <CreateGroupButton />
          </NavigationMenuItem>

          <NavigationMenuList className='gap-1 items-center'>
            <NavigationMenuItem>
              <LightSwitch />
            </NavigationMenuItem>
            <NavigationMenuItem>
              <AuthButton />
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
          <WorkspaceSelector />
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
