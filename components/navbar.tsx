'use client';

import ReduxProvider from '@/store/redux-provider';
import AuthButton from '@/components/auth-button';
import WorkspaceSelector from '@/components/workspace-selector';
import CreateGroupButton from '@/components/create-group-button';
import { cn } from '@/lib/utils';
import { LightSwitch } from '@/components/light-switch';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { useAppSelector } from '@/store/store';

const Navbar = () => {
  const isGuest = useAppSelector((state) => state.auth.isGuest);
  const user = useAppSelector((state) => state.auth.user);

  return (
    <NavigationMenu
      className={cn(
        'fixed bottom-0 max-w-[1000px] w-full hidden justify-center bg-transparent',
        {
          'sm:flex': user || isGuest,
        }
      )}
    >
      <div className='grow w-full bg-transparent'>
        <NavigationMenuList className='gap-2 bg-background border border-input p-2 m-2 rounded-lg justify-between items-center'>
          <NavigationMenuItem className='sm:gap-2 items-center hidden sm:flex'>
            <CreateGroupButton />
          </NavigationMenuItem>
          <NavigationMenuItem>
            <WorkspaceSelector />
          </NavigationMenuItem>
          <NavigationMenuList className='sm:gap-2 items-center hidden sm:flex'>
            <NavigationMenuItem>
              <LightSwitch />
            </NavigationMenuItem>
            <NavigationMenuItem>
              <AuthButton />
            </NavigationMenuItem>
          </NavigationMenuList>
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
