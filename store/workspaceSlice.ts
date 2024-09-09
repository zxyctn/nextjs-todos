import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import {
  WorkspaceWithGroups,
  GroupWithTasks,
  TaskWithActivities,
} from '@/lib/prisma';
import { Activity, Workspace } from '@prisma/client';
import { getCurrentWorkspace, orderGroups, orderTasks } from '@/lib/utils';

export interface GroupWithOrderedTasks extends GroupWithTasks {
  orderedTasks: TaskWithActivities[];
}

export interface WorkspaceWithOrderedGroups extends WorkspaceWithGroups {
  orderedGroups: GroupWithOrderedTasks[];
}

const initialState: {
  current: WorkspaceWithOrderedGroups;
  workspaces: Workspace[];
  isDragDisabled: {
    value: boolean;
    sourceDroppableId: number;
    destinationDroppableId: number;
  };
  isLoading: boolean;
} = {
  current: {
    id: '',
    name: '',
    groupOrder: [],
    groups: [],
    selected: true,
    userId: '',
    orderedGroups: [],
  },
  workspaces: [],
  isDragDisabled: {
    value: false,
    sourceDroppableId: -1,
    destinationDroppableId: -1,
  },
  isLoading: false,
};

export const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setWorkspaces: (state, action: PayloadAction<Workspace[]>) => {
      state.workspaces = action.payload;
      state.current = getCurrentWorkspace(
        action.payload[0] as WorkspaceWithGroups
      );
    },

    setCurrentWorkspace: (
      state,
      action: PayloadAction<WorkspaceWithGroups>
    ) => {
      state.current = getCurrentWorkspace(action.payload);
    },

    setOrderedGroups: (state, action: PayloadAction<number[]>) => {
      const orderedGroups = orderGroups(
        action.payload,
        state.current.groups
      ).map((group) => ({
        ...group,
        orderedTasks: orderTasks(action.payload, group.tasks),
      }));

      state.current = {
        ...state.current,
        groupOrder: action.payload,
        orderedGroups: orderedGroups,
      };
    },

    setOrderedTasks: (
      state,
      action: PayloadAction<{
        id: string;
        taskOrder: number[];
      }>
    ) => {
      const orderedGroups = state.current.orderedGroups.map((group) => {
        if (group.id !== action.payload.id) {
          return group;
        }

        return {
          ...group,
          orderedTasks: orderTasks(action.payload.taskOrder, group.tasks),
          taskOrder: action.payload.taskOrder,
        };
      });

      state.current = {
        ...state.current,
        orderedGroups,
      };
    },

    setGroupName: (
      state,
      action: PayloadAction<{ id: string; name: string }>
    ) => {
      state.current = getCurrentWorkspace({
        ...state.current,
        groups: state.current.groups.map((group) =>
          group.id === action.payload.id
            ? { ...group, name: action.payload.name }
            : group
        ),
      });
    },

    setIsDragDisabled: (
      state,
      action: PayloadAction<{
        value: boolean;
        sourceDroppableId: number;
        destinationDroppableId: number;
      }>
    ) => {
      state.isDragDisabled = action.payload;
    },

    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setTaskContent: (
      state,
      action: PayloadAction<{
        id: string;
        name?: string;
        description?: string;
        activities: Activity[];
      }>
    ) => {
      const newTaskContent: { [key: string]: string } = {};

      if (action.payload.name) {
        newTaskContent.name = action.payload.name;
      }

      if (action.payload.description) {
        newTaskContent.description = action.payload.description;
      }

      state.current = getCurrentWorkspace({
        ...state.current,
        groups: state.current.groups.map((group) => {
          return {
            ...group,
            tasks: group.tasks.map((task) =>
              task.id === action.payload.id
                ? {
                    ...task,
                    ...newTaskContent,
                    activities: [...action.payload.activities],
                  }
                : task
            ),
          };
        }),
      });
    },
  },
});

export const {
  setWorkspaces,
  setCurrentWorkspace,
  setOrderedGroups,
  setOrderedTasks,
  setGroupName,
  setIsDragDisabled,
  setIsLoading,
  setTaskContent,
} = workspaceSlice.actions;
export const workspaceReducer = workspaceSlice.reducer;
