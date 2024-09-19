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
  isLoading: {
    value: boolean;
    message: string;
    type: 'success' | 'error';
  };
} = {
  current: {
    id: '1',
    name: '💼 Work',
    groupOrder: ['11', '12', '13'],
    groups: [
      {
        id: '11',
        name: '📋 To do',
        taskOrder: ['111', '112'],
        tasks: [
          {
            id: '111',
            name: '🚀 Create a new project',
            description: 'Create a new project with Next.js',
            groupId: '1',
            createdAt: new Date(),
            activities: [
              {
                id: '1111',
                content: 'Create a new project with Next.js',
                createdAt: new Date(),
                taskId: '111',
              },
            ],
          },
          {
            id: '112',
            name: '🚀 Add Tailwind CSS',
            description: 'Add Tailwind CSS to the project',
            groupId: '1',
            createdAt: new Date(),
            activities: [
              {
                id: '1121',
                content: 'Add Tailwind CSS to the project',
                createdAt: new Date(),
                taskId: '112',
              },
            ],
          },
        ],
        workspaceId: '1',
      },
      {
        id: '12',
        name: '🚀 In progress',
        taskOrder: [],
        tasks: [],
        workspaceId: '1',
      },
      {
        id: '13',
        name: '🎉 Done',
        taskOrder: [],
        tasks: [],
        workspaceId: '1',
      },
    ],
    selected: true,
    userId: '',
    orderedGroups: [
      {
        id: '11',
        name: '📋 To do',
        taskOrder: ['111', '112'],
        tasks: [
          {
            id: '111',
            name: '🚀 Create a new project',
            description: 'Create a new project with Next.js',
            groupId: '1',
            createdAt: new Date(),
            activities: [
              {
                id: '1111',
                content: 'Create a new project with Next.js',
                createdAt: new Date(),
                taskId: '111',
              },
            ],
          },
          {
            id: '112',
            name: '🚀 Add Tailwind CSS',
            description: 'Add Tailwind CSS to the project',
            groupId: '1',
            createdAt: new Date(),
            activities: [
              {
                id: '1121',
                content: 'Add Tailwind CSS to the project',
                createdAt: new Date(),
                taskId: '112',
              },
            ],
          },
        ],
        orderedTasks: [
          {
            id: '111',
            name: '🚀 Create a new project',
            description: 'Create a new project with Next.js',
            groupId: '1',
            createdAt: new Date(),
            activities: [
              {
                id: '1111',
                content: 'Create a new project with Next.js',
                createdAt: new Date(),
                taskId: '111',
              },
            ],
          },
          {
            id: '112',
            name: '🚀 Add Tailwind CSS',
            description: 'Add Tailwind CSS to the project',
            groupId: '1',
            createdAt: new Date(),
            activities: [
              {
                id: '1121',
                content: 'Add Tailwind CSS to the project',
                createdAt: new Date(),
                taskId: '112',
              },
            ],
          },
        ],
        workspaceId: '1',
      },
      {
        id: '12',
        name: '🚀 In progress',
        taskOrder: [],
        tasks: [],
        workspaceId: '1',
        orderedTasks: [],
      },
      {
        id: '13',
        name: '🎉 Done',
        taskOrder: [],
        tasks: [],
        workspaceId: '1',
        orderedTasks: [],
      },
    ],
  },
  workspaces: [
    {
      id: '1',
      name: '💼 Work',
      groupOrder: ['1', '2', '3'],
      groups: [
        {
          id: '11',
          name: '📋 To do',
          taskOrder: ['111', '112'],
          tasks: [
            {
              id: '111',
              name: '🚀 Create a new project',
              description: 'Create a new project with Next.js',
              groupId: '1',
              createdAt: new Date(),
              activities: [
                {
                  id: '1111',
                  content: 'Create a new project with Next.js',
                  createdAt: new Date(),
                  taskId: '111',
                },
              ],
            },
            {
              id: '112',
              name: '🚀 Add Tailwind CSS',
              description: 'Add Tailwind CSS to the project',
              groupId: '1',
              createdAt: new Date(),
              activities: [
                {
                  id: '1121',
                  content: 'Add Tailwind CSS to the project',
                  createdAt: new Date(),
                  taskId: '112',
                },
              ],
            },
          ],
          workspaceId: '1',
        },
        {
          id: '12',
          name: '🚀 In progress',
          taskOrder: [],
          tasks: [],
          workspaceId: '1',
        },
        {
          id: '13',
          name: '🎉 Done',
          taskOrder: [],
          tasks: [],
          workspaceId: '1',
        },
      ],
      selected: true,
      userId: '',
    },
  ],
  isDragDisabled: {
    value: false,
    sourceDroppableId: '',
    destinationDroppableId: '',
  },
  isLoading: {
    value: false,
    message: '',
    type: 'success',
  },
};

export const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    // WORKSPACE
    setWorkspaces: (
      state,
      action: PayloadAction<WorkspaceWithGroups[] | null>
    ) => {
      state.workspaces = action.payload || [];
    },

    setCurrentWorkspace: (
      state,
      action: PayloadAction<WorkspaceWithGroups | null>
    ) => {
      state.current = action.payload
        ? getCurrentWorkspace(action.payload)
        : {
            id: '',
            name: '',
            groupOrder: [],
            groups: [],
            selected: false,
            userId: '',
            orderedGroups: [],
          };
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
      const newWorkspace = {
        ...state.current,
        name: action.payload.name,
      };

      state.workspaces = state.workspaces.map((w) =>
        w.id === action.payload.id ? newWorkspace : w
      );

      state.current = getCurrentWorkspace(newWorkspace);
    },

    deleteWorkspace: (state, action: PayloadAction<string>) => {
      const index = state.workspaces.findIndex((w) => w.id === action.payload);

      if (index > -1) {
        if (state.workspaces[index].id === state.current.id) {
          if (state.workspaces.length > 1) {
            state.current = getCurrentWorkspace({
              ...state.workspaces.filter((w) => w.id !== action.payload)[0],
              selected: true,
            });

            state.workspaces = state.workspaces
              .filter((w) => w.id !== action.payload)
              .map((w, index) => ({
                ...w,
                selected: index === 0,
              }));
          } else {
            state.current = {
              id: '',
              name: '',
              groupOrder: [],
              groups: [],
              selected: false,
              userId: '',
              orderedGroups: [],
            };

            state.workspaces = [];
          }
        } else {
          if (state.workspaces.length === 1) {
            state.current = {
              id: '',
              name: '',
              groupOrder: [],
              groups: [],
              selected: false,
              userId: '',
              orderedGroups: [],
            };

            state.workspaces = [];
          } else {
            state.workspaces = state.workspaces.filter(
              (w) => w.id !== action.payload
            );
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
      const groups = [
        ...state.current.groups,
        {
          id: action.payload.id,
          name: action.payload.name,
          taskOrder: [],
          tasks: [],
          workspaceId: state.current.id,
        },
      ];
      const groupOrder = [...state.current.groupOrder, action.payload.id];

      state.workspaces = state.workspaces.map((w) => {
        if (w.id === state.current.id) {
          return {
            ...w,
            groups,
            groupOrder,
          };
        }

        return w;
      });

      state.current = getCurrentWorkspace({
        ...state.current,
        groups,
        groupOrder,
      });
    },

    moveGroup: (
      state,
      action: PayloadAction<{ id: string; index: number }>
    ) => {
      const group = state.current.groups.find(
        (g) => g.id === action.payload.id
      );

      if (!group) {
        throw new Error(`Group ${action.payload.id} could not be found`);
      }

      const filteredGroups = state.current.groups.filter(
        (g) => g.id !== action.payload.id
      );
      const filteredGroupOrder = state.current.groupOrder.filter(
        (id) => id !== action.payload.id
      );

      const newState = {
        ...state.current,
        groups: [
          ...filteredGroups.slice(0, action.payload.index),
          group,
          ...filteredGroups.slice(action.payload.index),
        ],
        groupOrder: [
          ...filteredGroupOrder.slice(0, action.payload.index),
          action.payload.id,
          ...filteredGroupOrder.slice(action.payload.index),
        ],
      };

      state.workspaces = state.workspaces.map((w) =>
        w.id === state.current.id ? newState : w
      );

      state.current = getCurrentWorkspace(newState);
    },

    updateGroupName: (
      state,
      action: PayloadAction<{ id: string; name: string }>
    ) => {
      const newGroups = state.current.groups.map((group) =>
        group.id === action.payload.id
          ? { ...group, name: action.payload.name }
          : group
      );

      state.workspaces = state.workspaces.map((w) =>
        w.id === state.current.id ? { ...w, groups: newGroups } : w
      );

      state.current = getCurrentWorkspace({
        ...state.current,
        groups: newGroups,
      });
    },

    deleteGroup: (state, action: PayloadAction<string>) => {
      const newGroups = state.current.groups.filter(
        (group) => group.id !== action.payload
      );

      const newGroupOrder = state.current.groupOrder.filter(
        (id) => id !== action.payload
      );

      state.workspaces = state.workspaces.map((w) => ({
        ...w,
        groups: newGroups,
        groupOrder: newGroupOrder,
      }));

      state.current = getCurrentWorkspace({
        ...state.current,
        groups: newGroups,
        groupOrder: newGroupOrder,
      });
    },

    // TASK
    createTask: (
      state,
      action: PayloadAction<{
        id: string;
        name: string;
        description: string;
        groupId: string;
        activityId: string;
        activityContent: string;
      }>
    ) => {
      const newGroups = state.current.groups.map((group) =>
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
                  activities: [
                    {
                      id: action.payload.activityId,
                      content: action.payload.activityContent,
                      createdAt: new Date(),
                      taskId: action.payload.id,
                    },
                  ],
                },
              ],
              taskOrder: [...group.taskOrder, action.payload.id],
            }
          : group
      );

      state.workspaces = state.workspaces.map((w) =>
        w.id === state.current.id
          ? {
              ...w,
              groups: newGroups,
            }
          : w
      );

      state.current = getCurrentWorkspace({
        ...state.current,
        groups: newGroups,
      });
    },

    updateTaskContent: (
      state,
      action: PayloadAction<{
        taskId: string;
        name: string;
        description: string;
        activityId?: string;
        activityContent?: string;
        activityCreatedAt?: Date;
      }>
    ) => {
      const newGroups = state.current.groups.map((group) => {
        const activity =
          action.payload.activityId && action.payload.activityContent
            ? {
                id: action.payload.activityId,
                content: action.payload.activityContent,
                createdAt: action.payload.activityCreatedAt || new Date(),
                taskId: action.payload.taskId,
              }
            : undefined;

        return {
          ...group,
          tasks: group.tasks.map((task) =>
            task.id === action.payload.taskId
              ? {
                  ...task,
                  name: action.payload.name,
                  description: action.payload.description,
                  activities: activity
                    ? [...task.activities, activity]
                    : task.activities,
                }
              : task
          ),
        };
      });

      state.workspaces = state.workspaces.map((w) =>
        w.id === state.current.id
          ? {
              ...w,
              groups: newGroups,
            }
          : w
      );

      state.current = getCurrentWorkspace({
        ...state.current,
        groups: newGroups,
      });
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
      const newGroups = state.current.groups.map((group) => {
        let currentGroup = group;

        if (
          group.id === action.payload.sourceGroupId &&
          group.id === action.payload.destinationGroupId
        ) {
          const task = group.tasks.find((t) => t.id === action.payload.taskId)!;

          currentGroup = {
            ...group,
            tasks: group.tasks.filter(
              (task) => task.id !== action.payload.taskId
            ),
            taskOrder: group.taskOrder.filter(
              (id) => id !== action.payload.taskId
            ),
          };

          currentGroup = {
            ...currentGroup,
            tasks: [
              ...currentGroup.tasks.slice(0, action.payload.destinationIndex),
              task,
              ...currentGroup.tasks.slice(action.payload.destinationIndex),
            ],
            taskOrder: [
              ...currentGroup.taskOrder.slice(
                0,
                action.payload.destinationIndex
              ),
              action.payload.taskId,
              ...currentGroup.taskOrder.slice(action.payload.destinationIndex),
            ],
          };
        } else if (group.id === action.payload.sourceGroupId) {
          currentGroup = {
            ...group,
            tasks: group.tasks.filter(
              (task) => task.id !== action.payload.taskId
            ),
            taskOrder: group.taskOrder.filter(
              (id) => id !== action.payload.taskId
            ),
          };
        } else if (group.id === action.payload.destinationGroupId) {
          currentGroup = {
            ...group,
            tasks: [
              ...group.tasks.slice(0, action.payload.destinationIndex),
              ...state.current.groups
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

        return currentGroup;
      });

      state.workspaces = state.workspaces.map((w) =>
        w.id === state.current.id
          ? {
              ...w,
              groups: newGroups,
            }
          : w
      );

      state.current = getCurrentWorkspace({
        ...state.current,
        groups: newGroups,
      });
    },

    deleteTask: (state, action: PayloadAction<string>) => {
      const newGroups = state.current.groups.map((group) => ({
        ...group,
        tasks: group.tasks.filter((task) => task.id !== action.payload),
        taskOrder: group.taskOrder.filter((id) => id !== action.payload),
      }));

      state.workspaces = state.workspaces.map((w) =>
        w.id === state.current.id
          ? {
              ...w,
              groups: newGroups,
            }
          : w
      );

      state.current = getCurrentWorkspace({
        ...state.current,
        groups: newGroups,
      });
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

    setIsLoading: (
      state,
      action: PayloadAction<{
        value: boolean;
        message: string;
        type: 'success' | 'error';
      }>
    ) => {
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
  deleteWorkspace,

  // GROUP
  createGroup,
  moveGroup,
  updateGroupName,
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
