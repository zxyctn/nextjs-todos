import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import {
  GroupWithTasks,
  TaskWithActivities,
  WorkspaceWithGroups,
} from './prisma';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const orderGroups = (groupOrder: string[], groups: GroupWithTasks[]) => {
  return groupOrder.map((groupId) => {
    const group = groups.find((group) => group.id === groupId);
    if (!group) {
      throw new Error(`Group ${groupId} not found`);
    }

    return group;
  });
};

export const orderTasks = (
  taskOrder: string[],
  tasks: TaskWithActivities[]
) => {
  return taskOrder.map((taskId) => {
    const task = tasks.find((task) => task.id === taskId);

    if (!task) throw new Error(`Task ${taskId} not found`);

    return task;
  });
};

export const getCurrentWorkspace = (data: WorkspaceWithGroups) => {
  return {
    ...data,
    orderedGroups: orderGroups(data.groupOrder, data.groups).map((group) => ({
      ...group,
      orderedTasks: orderTasks(group.taskOrder, group.tasks),
    })),
  };
};
