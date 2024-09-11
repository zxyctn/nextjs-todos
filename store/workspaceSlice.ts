import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import {
  WorkspaceWithGroups,
  GroupWithTasks,
  TaskWithActivities,
} from '@/lib/prisma';

import { getCurrentWorkspace } from '@/lib/utils';

export interface GroupWithOrderedTasks extends GroupWithTasks {
  orderedTasks: TaskWithActivities[];
}

export interface WorkspaceWithOrderedGroups extends WorkspaceWithGroups {
  orderedGroups: GroupWithOrderedTasks[];
}

const initialState: {
  current: WorkspaceWithOrderedGroups;
  workspaces: WorkspaceWithGroups[];
  isDragDisabled: {
    value: boolean;
    sourceDroppableId: string;
    destinationDroppableId: string;
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
    sourceDroppableId: '',
    destinationDroppableId: '',
  },
  isLoading: false,
};

export const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    // WORKSPACE
    setWorkspaces: (state, action: PayloadAction<WorkspaceWithGroups[]>) => {
      state.workspaces = action.payload;
    },

    setCurrentWorkspace: (
      state,
      action: PayloadAction<WorkspaceWithGroups>
    ) => {
      state.current = getCurrentWorkspace(action.payload);
      state.workspaces = state.workspaces.map((w) => ({
        ...w,
        selected: w.id === state.current.id,
      }));
    },

    createWorkspace: (
      state,
      action: PayloadAction<{ id: string; name: string }>
    ) => {
      state.current = {
        id: action.payload.id,
        name: action.payload.name,
        groupOrder: [],
        orderedGroups: [],
        groups: [],
        selected: true,
        userId: '',
      };

      state.workspaces = [
        ...state.workspaces.map((w) => ({
          ...w,
          selected: false,
        })),
        state.current,
      ];
    },

    updateWorkspaceName: (
      state,
      action: PayloadAction<{ id: string; name: string }>
    ) => {
      state.workspaces = state.workspaces.map((w) =>
        w.id === action.payload.id
          ? {
              ...w,
              name: action.payload.name,
            }
          : w
      );

      state.current = getCurrentWorkspace(
        state.workspaces.find((w) => w.id === state.current.id)!
      );
    },

    updateWorkspaceGroupOrder: (
      state,
      action: PayloadAction<{ id: string; groupOrder: string[] }>
    ) => {
      state.workspaces = state.workspaces.map((w) =>
        w.id === action.payload.id
          ? {
              ...w,
              groupOrder: action.payload.groupOrder,
            }
          : w
      );

      state.current = getCurrentWorkspace(
        state.workspaces.find((w) => w.id === state.current.id)!
      );
    },

    deleteWorkspace: (state, action: PayloadAction<string>) => {
      const index = state.workspaces.findIndex((w) => w.id === action.payload);

      if (index) {
        if (state.workspaces[0].selected && state.workspaces.length > 1) {
          state.workspaces = state.workspaces.filter(
            (w) => w.id !== action.payload
          );

          if (state.workspaces.length > 0) {
            state.current = getCurrentWorkspace({
              ...state.workspaces[0],
              selected: true,
            });

            state.workspaces = state.workspaces.map((w) => ({
              ...w,
              selected: w.id === state.current.id,
            }));
          }
        }
      } else {
        throw new Error(`Workspace ${action.payload} could not be found`);
      }
    },

    // GROUP
    createGroup: (
      state,
      action: PayloadAction<{ id: string; name: string }>
    ) => {
      state.workspaces = state.workspaces.map((w) => {
        if (w.id === state.current.id) {
          return {
            ...w,
            groups: [
              ...w.groups,
              {
                id: action.payload.id,
                name: action.payload.name,
                taskOrder: [],
                tasks: [],
                workspaceId: state.current.id,
              },
            ],
          };
        }

        return w;
      });

      state.current = getCurrentWorkspace(
        state.workspaces.find((w) => w.id === state.current.id)!
      );
    },

    updateGroupName: (
      state,
      action: PayloadAction<{ id: string; name: string }>
    ) => {
      state.workspaces = state.workspaces.map((w) => ({
        ...w,
        groups: w.groups.map((group) =>
          group.id === action.payload.id
            ? { ...group, name: action.payload.name }
            : group
        ),
      }));

      state.current = getCurrentWorkspace(
        state.workspaces.find((w) => w.id === state.current.id)!
      );
    },

    updateGroupTaskOrder: (
      state,
      action: PayloadAction<{
        id: string;
        taskOrder: string[];
      }>
    ) => {
      state.workspaces = state.workspaces.map((w) => ({
        ...w,
        groups: w.groups.map((group) =>
          group.id === action.payload.id
            ? { ...group, taskOrder: action.payload.taskOrder }
            : group
        ),
      }));

      state.current = getCurrentWorkspace(
        state.workspaces.find((w) => w.id === state.current.id)!
      );
    },

    deleteGroup: (state, action: PayloadAction<string>) => {
      state.workspaces = state.workspaces.map((w) => ({
        ...w,
        groups: w.groups.filter((group) => group.id !== action.payload),
        groupOrder: w.groupOrder.filter((id) => id !== action.payload),
      }));

      state.current = getCurrentWorkspace(
        state.workspaces.find((w) => w.id === state.current.id)!
      );
    },

    // TASK
    createTask: (
      state,
      action: PayloadAction<{
        id: string;
        name: string;
        description: string;
        groupId: string;
      }>
    ) => {
      state.workspaces = state.workspaces.map((w) => ({
        ...w,
        groups: w.groups.map((group) =>
          group.id === action.payload.groupId
            ? {
                ...group,
                tasks: [
                  ...group.tasks,
                  {
                    id: action.payload.id,
                    name: action.payload.name,
                    description: action.payload.description,
                    groupId: action.payload.groupId,
                    createdAt: new Date(),
                    activities: [],
                  },
                ],
                taskOrder: [...group.taskOrder, action.payload.id],
              }
            : group
        ),
      }));

      state.current = getCurrentWorkspace(
        state.workspaces.find((w) => w.id === state.current.id)!
      );
    },

    updateTaskContent: (
      state,
      action: PayloadAction<{
        taskId: string;
        name: string;
        description: string;
        activityId: string;
        activityContent: string;
      }>
    ) => {
      state.workspaces = state.workspaces.map((w) => ({
        ...w,
        groups: w.groups.map((group) => ({
          ...group,
          tasks: group.tasks.map((task) =>
            task.id === action.payload.taskId
              ? {
                  ...task,
                  name: action.payload.name,
                  description: action.payload.description,
                }
              : task
          ),
        })),
      }));

      state.current = getCurrentWorkspace(
        state.workspaces.find((w) => w.id === state.current.id)!
      );

      state.current = {
        ...state.current,
        orderedGroups: state.current.orderedGroups.map((group) => ({
          ...group,
          orderedTasks: group.orderedTasks.map((task) =>
            task.id === action.payload.taskId
              ? {
                  ...task,
                  activities: [
                    ...task.activities,
                    {
                      id: action.payload.activityId,
                      content: action.payload.activityContent,
                      createdAt: new Date(),
                      taskId: action.payload.taskId,
                    },
                  ],
                }
              : task
          ),
        })),
      };
    },

    moveTask: (
      state,
      action: PayloadAction<{
        sourceGroupId: string;
        destinationGroupId: string;
        taskId: string;
        sourceIndex: number;
        destinationIndex: number;
      }>
    ) => {
      state.workspaces = state.workspaces.map((w) => ({
        ...w,
        groups: w.groups.map((group) => {
          if (group.id === action.payload.sourceGroupId) {
            return {
              ...group,
              tasks: group.tasks.filter(
                (task) => task.id !== action.payload.taskId
              ),
              taskOrder: group.taskOrder.filter(
                (id) => id !== action.payload.taskId
              ),
            };
          }

          if (group.id === action.payload.destinationGroupId) {
            return {
              ...group,
              tasks: [
                ...group.tasks.slice(0, action.payload.destinationIndex),
                ...w.groups
                  .find((g) => g.id === action.payload.sourceGroupId)!
                  .tasks.filter((task) => task.id === action.payload.taskId),
                ...group.tasks.slice(action.payload.destinationIndex),
              ],
              taskOrder: [
                ...group.taskOrder.slice(0, action.payload.destinationIndex),
                action.payload.taskId,
                ...group.taskOrder.slice(action.payload.destinationIndex),
              ],
            };
          }

          return group;
        }),
      }));

      state.current = getCurrentWorkspace(
        state.workspaces.find((w) => w.id === state.current.id)!
      );
    },

    deleteTask: (state, action: PayloadAction<string>) => {
      state.workspaces = state.workspaces.map((w) => ({
        ...w,
        groups: w.groups.map((group) => ({
          ...group,
          tasks: group.tasks.filter((task) => task.id !== action.payload),
          taskOrder: group.taskOrder.filter((id) => id !== action.payload),
        })),
      }));

      state.current = getCurrentWorkspace(
        state.workspaces.find((w) => w.id === state.current.id)!
      );
    },

    setIsDragDisabled: (
      state,
      action: PayloadAction<{
        value: boolean;
        sourceDroppableId: string;
        destinationDroppableId: string;
      }>
    ) => {
      state.isDragDisabled = action.payload;
    },

    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  // WORKSPACE
  setWorkspaces,
  setCurrentWorkspace,
  createWorkspace,
  updateWorkspaceName,
  updateWorkspaceGroupOrder,
  deleteWorkspace,

  // GROUP
  createGroup,
  updateGroupName,
  updateGroupTaskOrder,
  deleteGroup,

  // TASK
  createTask,
  updateTaskContent,
  moveTask,
  deleteTask,

  setIsDragDisabled,
  setIsLoading,
} = workspaceSlice.actions;
export const workspaceReducer = workspaceSlice.reducer;
