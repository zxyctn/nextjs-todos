import prisma from './prisma';

// WORKSPACE
export const createWorkspace = async (name: string, userId: string) => {
  const workspaceIncludes = {
    groups: {
      include: {
        tasks: {
          include: {
            activities: {
              orderBy: { createdAt: 'desc' } as const,
            },
          },
        },
      },
    },
  };

  return await prisma.$transaction(async (prisma) => {
    // Create the new workspace and select it
    const selected = await prisma.workspace.create({
      data: {
        name,
        selected: true,
        userId, // Use the provided userId
      },
      include: workspaceIncludes,
    });

    if (!selected) {
      throw new Error(`Workspace could not be created`);
    }

    // Deselect all other workspaces for the user
    await prisma.workspace.updateMany({
      where: { id: { not: selected.id }, userId },
      data: { selected: false },
    });

    // Retrieve all workspaces for the user
    const allWorkspaces = await prisma.workspace.findMany({
      where: { userId },
      include: workspaceIncludes,
    });

    return {
      workspaces: allWorkspaces,
      selected,
    };
  });
};

export const getWorkspaces = async (userId: string) => {
  const workspaces = await prisma.workspace.findMany({
    where: { userId },
    include: {
      groups: {
        include: {
          tasks: {
            include: {
              activities: {
                orderBy: { createdAt: 'desc' },
              },
            },
          },
        },
      },
    },
  });

  if (workspaces.length > 0) {
    // Find the selected workspace in the already retrieved workspaces
    const selected = workspaces.find((workspace) => workspace.selected);

    if (!selected) {
      throw new Error(`Selected workspace could not be found`);
    }

    return {
      workspaces,
      selected,
    };
  } else {
    return {
      workspaces,
      selected: null,
    };
  }
};

export const selectWorkspace = async (id: string, userId: string) => {
  const workspaceIncludes = {
    groups: {
      include: {
        tasks: {
          include: {
            activities: {
              orderBy: { createdAt: 'desc' } as const,
            },
          },
        },
      },
    },
  };

  return await prisma.$transaction(async (prisma) => {
    // Select the workspace
    const selected = await prisma.workspace.update({
      where: { id },
      data: { selected: true },
      include: workspaceIncludes,
    });

    if (!selected) {
      throw new Error(`Workspace ${id} could not be selected`);
    }

    // Deselect all other workspaces for the user
    await prisma.workspace.updateMany({
      where: { id: { not: id }, userId },
      data: { selected: false },
    });

    // Retrieve all workspaces for the user
    const allWorkspaces = await prisma.workspace.findMany({
      where: { userId },
      include: workspaceIncludes,
    });

    return {
      workspaces: allWorkspaces,
      selected,
    };
  });
};

export const updateWorkspaceName = async (id: string, name: string) => {
  return await prisma.workspace.update({
    where: { id },
    data: { name },
    include: {
      groups: {
        include: {
          tasks: {
            include: {
              activities: {
                orderBy: { createdAt: 'desc' },
              },
            },
          },
        },
      },
    },
  });
};

export const deleteWorkspace = async (id: string, userId: string) => {
  const workspaceIncludes = {
    groups: {
      include: {
        tasks: {
          include: {
            activities: {
              orderBy: { createdAt: 'desc' } as const,
            },
          },
        },
      },
    },
  };

  return await prisma.$transaction(async (prisma) => {
    // Delete the workspace
    const deletedWorkspace = await prisma.workspace.delete({
      where: { id, userId },
    });

    // If the deleted workspace was selected, select the next available one
    if (deletedWorkspace.selected) {
      const firstWorkspace = await prisma.workspace.findFirst({
        where: { userId },
      });

      if (firstWorkspace) {
        // Set the first workspace as selected
        const selected = await prisma.workspace.update({
          where: { id: firstWorkspace.id },
          data: { selected: true },
          include: workspaceIncludes,
        });

        // Deselect other workspaces
        await prisma.workspace.updateMany({
          where: { id: { not: firstWorkspace.id }, userId },
          data: { selected: false },
        });

        // Fetch all updated workspaces
        const allWorkspaces = await prisma.workspace.findMany({
          where: { userId },
          include: workspaceIncludes,
        });

        return {
          workspaces: allWorkspaces,
          selected,
        };
      }
    }

    return {
      workspaces: await prisma.workspace.findMany({
        where: { userId },
        include: workspaceIncludes,
      }),
      selected: await prisma.workspace.findFirst({
        where: { selected: true, userId },
        include: workspaceIncludes,
      }),
    };
  });
};

// GROUP
export const createGroup = async (workspaceId: string, name: string) => {
  const groupIncludes = {
    tasks: {
      include: {
        activities: {
          orderBy: { createdAt: 'desc' } as const,
        },
      },
    },
  };

  return await prisma.$transaction(async (prisma) => {
    // Create the group
    const newGroup = await prisma.group.create({
      data: {
        name,
        workspaceId,
      },
      include: groupIncludes,
    });

    // Update workspace with the new group order
    const updatedWorkspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        groupOrder: { push: newGroup.id }, // Append new group ID to groupOrder
      },
      include: {
        groups: {
          include: groupIncludes,
        },
      },
    });

    return {
      group: newGroup,
      workspace: updatedWorkspace,
    };
  });
};

export const moveGroup = async (id: string, index: number) => {
  const groupIncludes = {
    tasks: {
      include: {
        activities: {
          orderBy: { createdAt: 'desc' } as const,
        },
      },
    },
  };

  return await prisma.$transaction(async (prisma) => {
    // Fetch the group and workspace in one go
    const group = await prisma.group.findUnique({
      where: { id },
      include: groupIncludes,
    });

    if (!group) {
      throw new Error(`Group ${id} not found`);
    }

    // Fetch the workspace before updating
    const workspace = await prisma.workspace.findUnique({
      where: { id: group.workspaceId },
      select: {
        id: true,
        groupOrder: true,
        groups: { include: groupIncludes },
      }, // Select only the needed fields
    });

    if (!workspace) {
      throw new Error(`Workspace ${group.workspaceId} not found`);
    }

    // Update the workspace's group order
    const updatedWorkspace = await prisma.workspace.update({
      where: { id: workspace.id },
      data: {
        groupOrder: {
          set: [
            ...workspace.groupOrder
              .filter((groupId) => groupId !== id)
              .slice(0, index),
            id,
            ...workspace.groupOrder
              .filter((groupId) => groupId !== id)
              .slice(index),
          ],
        },
      },
      include: {
        groups: {
          include: groupIncludes,
        },
      },
    });

    return { group, workspace: updatedWorkspace };
  });
};

export const updateGroupName = async (id: string, name: string) => {
  const groupIncludes = {
    tasks: {
      include: {
        activities: {
          orderBy: { createdAt: 'desc' } as const,
        },
      },
    },
  };

  return await prisma.group.update({
    where: { id },
    data: { name },
    include: groupIncludes,
  });
};

export const deleteGroup = async (id: string) => {
  return await prisma.$transaction(async (prisma) => {
    // Delete the group
    const group = await prisma.group.delete({
      where: { id },
    });

    // Fetch the workspace
    const workspace = await prisma.workspace.findUnique({
      where: { id: group.workspaceId },
    });

    if (!workspace) {
      throw new Error(`Workspace ${group.workspaceId} not found`);
    }

    // Update the workspace by removing the deleted group from groupOrder
    const updatedWorkspace = await prisma.workspace.update({
      where: { id: group.workspaceId },
      data: {
        groupOrder: {
          set: workspace.groupOrder.filter((groupId) => groupId !== id),
        },
      },
      include: {
        groups: {
          include: {
            tasks: {
              include: {
                activities: {
                  orderBy: { createdAt: 'desc' },
                },
              },
            },
          },
        },
      },
    });

    return {
      group,
      workspace: updatedWorkspace,
    };
  });
};

// TASK
export const createTask = async (
  groupId: string,
  name: string,
  description: string
) => {
  const includes = {
    activities: {
      orderBy: { createdAt: 'desc' } as const,
    },
  };

  return await prisma.$transaction(async (prisma) => {
    // Create the task
    const task = await prisma.task.create({
      data: {
        name,
        description,
        groupId,
      },
      include: includes,
    });

    // Fetch and update the group
    const group = await prisma.group.update({
      where: { id: groupId },
      data: {
        taskOrder: {
          push: task.id, // Append task ID directly
        },
      },
      include: {
        tasks: {
          include: includes,
        },
      },
    });

    // Create the activity
    const activity = await prisma.activity.create({
      data: {
        taskId: task.id,
        content: `Task created in group ${group.name}`,
      },
    });

    return {
      task,
      group,
      activity,
    };
  });
};

export const moveTask = async (id: string, index: number, groupId: string) => {
  return await prisma.$transaction(async (prisma) => {
    // Find the task and its old group
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        group: true,
      },
    });

    if (!task) {
      throw new Error(`Task ${id} not found`);
    }

    const oldGroupId = task.groupId;

    // Update task's group
    const updatedTask = await prisma.task.update({
      where: { id },
      data: { groupId },
      include: {
        group: true,
      },
    });

    // Update old group's task order
    await prisma.group.update({
      where: { id: oldGroupId },
      data: {
        taskOrder: {
          set: task.group.taskOrder.filter((taskId) => taskId !== id),
        },
      },
    });

    // Update new group's task order
    const newGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        taskOrder: {
          set: [
            ...updatedTask.group.taskOrder.slice(0, index),
            id,
            ...updatedTask.group.taskOrder.slice(index),
          ],
        },
      },
    });

    // Create an activity if the group has changed
    if (oldGroupId !== groupId) {
      const activity = await prisma.activity.create({
        data: {
          taskId: id,
          content: `Task moved to group ${newGroup.name}`,
        },
      });

      return {
        task: updatedTask,
        activity,
      };
    }

    return {
      task: updatedTask,
    };
  });
};

export const updateTaskContent = async (
  id: string,
  content: { name: string; description: string }
) => {
  const task = await prisma.task.findUnique({
    where: { id },
  });

  if (!task) {
    throw new Error(`Task ${id} not found`);
  }

  // Determine what changed
  const nameChanged = content.name !== task.name;
  const descriptionChanged = content.description !== task.description;

  if (!nameChanged && !descriptionChanged) {
    return { task };
  }

  // Create activity content based on what changed
  const activityContent = [
    nameChanged ? `Task name updated: ${content.name}` : null,
    descriptionChanged
      ? `Task description updated: ${content.description}`
      : null,
  ]
    .filter(Boolean)
    .join(' and ');

  // Use a transaction to update the task and create the activity
  const [updatedTask, activity] = await prisma.$transaction([
    prisma.task.update({
      where: { id },
      data: { ...content },
    }),
    prisma.activity.create({
      data: {
        taskId: id,
        content: activityContent,
      },
    }),
  ]);

  return {
    task: updatedTask,
    activity,
  };
};

export const deleteTask = async (id: string) => {
  return await prisma.$transaction(async (prisma) => {
    // Find the task and its associated group
    const task = await prisma.task.findUnique({
      where: { id },
      include: { group: true }, // Fetch the group directly
    });

    if (!task) {
      throw new Error(`Task ${id} not found`);
    }

    // Delete the task
    await prisma.task.delete({
      where: { id },
    });

    // Update the group's task order
    const updatedGroup = await prisma.group.update({
      where: { id: task.groupId },
      data: {
        taskOrder: {
          set: task.group.taskOrder.filter((taskId) => taskId !== id), // Update task order directly
        },
      },
      include: {
        tasks: {
          include: {
            activities: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    return {
      task,
      group: updatedGroup,
    };
  });
};
