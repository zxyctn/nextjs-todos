'use client';

import TaskGroup from '@/components/task-group';
import { Workspace } from '@prisma/client';
import { useEffect, useState } from 'react';

const Home = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<any>();

  const fetchWorkspaces = async () => {
    const workspaces = await fetch('/api/workspace').then((res) => res.json());
    setWorkspaces(workspaces);
    setCurrentWorkspace(workspaces[0]);

    console.log(workspaces);
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  return (
    <div className='flex justify-center grow'>
      <div className='grow pt-8'>
        <div className='flex gap-32'>
          {currentWorkspace?.groups.map((group: any) => (
            <TaskGroup key={group.id} group={group} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
