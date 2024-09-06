'use client';

import TaskGroup from '@/components/task-group';
import { Workspace } from '@prisma/client';
import { useEffect, useState } from 'react';
import type { GroupWithTasks } from '@/lib/prisma';

const Home = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<any>();

  const fetchWorkspaces = async () => {
    const workspaces = await fetch('/api/workspace').then((res) => res.json());
    setWorkspaces(workspaces);
    setCurrentWorkspace(workspaces[0]);
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  return (
    <div className='flex justify-center grow'>
      <div className='grow'>
        <div className='flex gap-32'>
          {currentWorkspace?.groups.map((group: GroupWithTasks) => (
            <TaskGroup key={group.id} group={group} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
