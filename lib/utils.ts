import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import type { DropResult } from '@hello-pangea/dnd';

import {
  GroupWithTasks,
  TaskWithActivities,
  WorkspaceWithGroups,
} from './prisma';
import {
  moveGroup,
  moveTask,
  setIsDragDisabled,
  setIsLoading,
  updateTaskContent,
  WorkspaceWithOrderedGroups,
} from '@/store/workspaceSlice';

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

export const handleDragEnd = async (
  result: DropResult,
  isGuest: boolean,
  dispatch: any,
  currentWorkspace: WorkspaceWithOrderedGroups
) => {
  const { source, destination, type } = result;

  // dropped outside the list
  if (!destination) {
    return;
  }
  if (type === 'task') {
    const sInd = source.droppableId.split('-')[1];
    const dInd = destination.droppableId.split('-')[1];
    const taskId = result.draggableId.split('-')[1];

    if (sInd === dInd && source.index === destination.index) return;

    dispatch(
      setIsDragDisabled({
        value: true,
        sourceDroppableId: sInd,
        destinationDroppableId: dInd,
      })
    );

    dispatch(
      setIsLoading({
        value: true,
        message: 'Moving task...',
        type: 'success',
      })
    );

    dispatch(
      moveTask({
        sourceGroupId: sInd,
        destinationGroupId: dInd,
        taskId,
        sourceIndex: source.index,
        destinationIndex: destination.index,
      })
    );

    if (!isGuest) {
      const res = await fetch(`/api/task/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: dInd,
          index: destination.index,
        }),
      });

      dispatch(
        setIsDragDisabled({
          value: false,
          sourceDroppableId: '',
          destinationDroppableId: '',
        })
      );

      if (!res.ok) {
        dispatch(
          moveTask({
            sourceGroupId: dInd,
            destinationGroupId: sInd,
            taskId,
            sourceIndex: destination.index,
            destinationIndex: source.index,
          })
        );

        dispatch(
          setIsLoading({
            value: false,
            message: 'Failed moving task',
            type: 'error',
          })
        );

        throw new Error('Failed moving task');
      }

      const { task, activity } = await res.json();

      if (activity) {
        dispatch(
          updateTaskContent({
            taskId: task.id,
            name: task.name,
            description: task.description,
            activityId: activity.id,
            activityContent: activity.content,
          })
        );
      } else {
        dispatch(
          updateTaskContent({
            taskId: task.id,
            name: task.name,
            description: task.description,
          })
        );
      }
    } else {
      dispatch(
        setIsDragDisabled({
          value: false,
          sourceDroppableId: '',
          destinationDroppableId: '',
        })
      );

      const task = currentWorkspace.groups
        .find((group) => group.id === sInd)
        ?.tasks.find((task) => task.id === taskId);

      const newGroup = currentWorkspace.groups.find(
        (group) => group.id === dInd
      );

      if (!task || !newGroup) {
        dispatch(
          setIsLoading({
            value: false,
            message: 'Failed moving task',
            type: 'error',
          })
        );

        throw new Error('Failed moving task');
      }

      const activity =
        sInd === dInd
          ? undefined
          : {
              id: `activity-${+new Date()}`,
              content: `Task moved to group ${newGroup.name}`,
            };

      if (activity) {
        dispatch(
          updateTaskContent({
            taskId: task.id,
            name: task.name,
            description: task.description || '',
            activityId: activity.id,
            activityContent: activity.content,
          })
        );
      } else {
        dispatch(
          updateTaskContent({
            taskId: task.id,
            name: task.name,
            description: task.description || '',
          })
        );
      }
    }

    dispatch(
      setIsLoading({
        value: false,
        message: 'Moved task successfully',
        type: 'success',
      })
    );
  } else {
    if (source.index === destination.index) return;

    const groupId = result.draggableId.split('-')[1];

    dispatch(
      setIsDragDisabled({
        value: true,
        sourceDroppableId: 'workspace',
        destinationDroppableId: 'workspace',
      })
    );

    dispatch(
      moveGroup({
        id: groupId,
        index: destination.index,
      })
    );

    dispatch(
      setIsLoading({
        value: true,
        message: 'Moving group...',
        type: 'success',
      })
    );

    if (!isGuest) {
      const res = await fetch(`/api/group/${groupId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          index: destination.index,
        }),
      });

      if (!res.ok) {
        dispatch(
          moveGroup({
            id: groupId,
            index: source.index,
          })
        );

        dispatch(
          setIsLoading({
            value: false,
            message: 'Failed moving group',
            type: 'error',
          })
        );

        dispatch(
          setIsDragDisabled({
            value: false,
            sourceDroppableId: '',
            destinationDroppableId: '',
          })
        );

        throw new Error('Failed moving group');
      }
    }

    dispatch(
      setIsLoading({
        value: false,
        message: 'Moved group successfully',
        type: 'success',
      })
    );

    dispatch(
      setIsDragDisabled({
        value: false,
        sourceDroppableId: '',
        destinationDroppableId: '',
      })
    );
  }
};
