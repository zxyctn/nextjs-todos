import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import {
  WorkspaceWithGroups,
  GroupWithTasks,
  TaskWithActivities,
} from '@/lib/prisma';
import { Workspace } from '@prisma/client';
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
  },
});

export const {
  setWorkspaces,
  setCurrentWorkspace,
  setOrderedGroups,
  setOrderedTasks,
} = workspaceSlice.actions;
export const workspaceReducer = workspaceSlice.reducer;
