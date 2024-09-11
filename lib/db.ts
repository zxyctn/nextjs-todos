import prisma from './prisma';

// WORKSPACE
export const createWorkspace = async (name: string) => {
  const selected = await prisma.workspace.create({
    data: {
      name,
      selected: true,
      userId: '1', // TODO: replace with actual user id
    },
    include: {
      groups: {
        include: {
          tasks: true,
        },
      },
    },
  });

  if (!selected) {
    throw new Error(`Workspace could not be created`);
  } else {
    const workspaces = await prisma.workspace.updateMany({
      where: { id: { not: selected.id }, userId: '1' }, // TODO: replace with actual user id
      data: { selected: false },
    });

    if (!workspaces) {
      throw new Error(`Workspaces could not be updated`);
    } else {
      return {
        workspaces,
        selected,
      };
    }
  }
};

export const getWorkspaces = async (userId: string) => {
  const workspaces = await prisma.workspace.findMany({
    where: { userId, selected: false },
  });

  if (!workspaces) {
    throw new Error(`Workspaces could not be found`);
  } else {
    const selected = await prisma.workspace.findFirst({
      where: { userId, selected: true },
      include: {
        groups: {
          include: {
            tasks: true,
          },
        },
      },
    });

    if (!selected) {
      throw new Error(`Selected workspace could not be found`);
    } else {
      return {
        workspaces,
        selected,
      };
    }
  }
};

export const selectWorkspace = async (id: string) => {
  const selected = await prisma.workspace.update({
    where: { id },
    data: { selected: true },
    include: {
      groups: {
        include: {
          tasks: true,
        },
      },
    },
  });

  if (!selected) {
    throw new Error(`Workspace ${id} could not be selected`);
  } else {
    const workspaces = await prisma.workspace.updateMany({
      where: { id: { not: id }, userId: '1' }, // TODO: replace with actual user id
      data: { selected: false },
    });

    if (!workspaces) {
      throw new Error(`Workspaces could not be updated`);
    } else {
      return {
        workspaces,
        selected,
      };
    }
  }
};

export const updateWorkspaceName = async (id: string, name: string) => {
  const selected = await prisma.workspace.update({
    where: { id },
    data: { name },
    include: {
      groups: {
        include: {
          tasks: true,
        },
      },
    },
  });

  if (!selected) {
    throw new Error(`Workspace ${id} could not be updated`);
  } else {
    return selected;
  }
};

export const updateWorkspaceGroupOrder = async (
  id: string,
  groupOrder: string[]
) => {
  const selected = await prisma.workspace.update({
    where: { id },
    data: { groupOrder },
    include: {
      groups: {
        include: {
          tasks: true,
        },
      },
    },
  });

  if (!selected) {
    throw new Error(`Workspace ${id} could not be updated`);
  }

  return selected;
};

export const deleteWorkspace = async (id: string) => {
  const workspace = await prisma.workspace.delete({
    where: { id },
  });

  if (workspace.selected) {
    const first = await prisma.workspace.findFirst({
      where: { userId: '1' }, // TODO: replace with actual user id
    });

    if (first) {
      const selected = await prisma.workspace.update({
        where: { id: first.id },
        data: { selected: true },
      });

      const workspaces = await prisma.workspace.updateMany({
        where: { id: { not: first.id }, userId: '1' }, // TODO: replace with actual user id
        data: { selected: false },
      });

      return {
        workspaces,
        selected,
      };
    }
  }

  return await getWorkspaces('1'); // TODO: replace with actual user id
};

// GROUP
export const createGroup = async (workspaceId: string, name: string) => {
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId },
  });

  if (workspace) {
    const group = await prisma.group.create({
      data: {
        name,
        workspaceId,
      },
      include: {
        tasks: true,
      },
    });

    if (group) {
      const updated = await prisma.workspace.update({
        where: { id: workspaceId },
        data: { groupOrder: [...workspace.groupOrder, group.id] },
      });

      if (updated) {
        return {
          group: group,
          workspace: updated,
        };
      } else {
        throw new Error(`Group could not be created`);
      }
    } else {
      throw new Error(`Group could not be created`);
    }
  } else {
    throw new Error(`Workspace ${workspaceId} not found`);
  }
};

export const updateGroupTaskOrder = async (id: string, taskOrder: string[]) => {
  const group = await prisma.group.update({
    where: { id },
    data: { taskOrder },
  });

  return group;
};

export const updateGroupName = async (id: string, name: string) => {
  const group = await prisma.group.update({
    where: { id },
    data: { name },
  });

  return group;
};

export const deleteGroup = async (id: string) => {
  const group = await prisma.group.delete({
    where: { id },
  });

  if (group) {
    const workspace = await prisma.workspace.findFirst({
      where: { id: group.workspaceId },
    });

    if (workspace) {
      const updated = await prisma.workspace.update({
        where: { id: group.workspaceId },
        data: {
          groupOrder: workspace.groupOrder.filter((groupId) => groupId !== id),
        },
      });

      if (updated) {
        return {
          group,
          workspace: updated,
        };
      } else {
        throw new Error(`Group could not be deleted`);
      }
    } else {
      throw new Error(`Workspace ${group.workspaceId} not found`);
    }
  } else {
    throw new Error(`Group ${id} not found`);
  }
};

// TASK
export const createTask = async (
  groupId: string,
  name: string,
  description: string
) => {
  const task = await prisma.task.create({
    data: {
      name,
      description,
      groupId,
    },
  });

  if (task) {
    const group = await prisma.group.findFirst({
      where: { id: groupId },
    });

    if (group) {
      const updated = await prisma.group.update({
        where: { id: groupId },
        data: { taskOrder: [...group.taskOrder, task.id] },
      });

      if (updated) {
        return {
          task,
          group: updated,
        };
      } else {
        throw new Error(`Task could not be created`);
      }
    } else {
      throw new Error(`Group ${groupId} not found`);
    }
  } else {
    throw new Error(`Task could not be created`);
  }
};

export const updateTaskGroup = async (
  id: string,
  index: number,
  groupId: string
) => {
  const task = await prisma.task.findFirst({
    where: { id },
    include: {
      group: true,
    },
  });

  const updated = await prisma.task.update({
    where: { id },
    data: { groupId },
    include: {
      group: true,
    },
  });

  if (task && updated) {
    await updateGroupTaskOrder(
      task.group.id,
      task.group.taskOrder.filter((taskId) => taskId !== id) || []
    );

    await updateGroupTaskOrder(updated.group.id, [
      ...updated.group.taskOrder.slice(0, index),
      id,
      ...updated.group.taskOrder.slice(index),
    ]);

    await prisma.activity.create({
      data: {
        taskId: id,
        content: `Task moved to group ${updated.group.name}`,
      },
    });

    return task;
  } else if (!task) {
    throw new Error(`Task ${id} not found`);
  } else {
    throw new Error(`Task ${id} could not be updated`);
  }
};

export const updateTaskContent = async (
  id: string,
  content: { name: string; description: string }
) => {
  const task = await prisma.task.findFirst({
    where: { id },
  });

  if (task) {
    if (content.name !== task.name) {
      if (content.description !== task.description) {
        await prisma.activity.create({
          data: {
            taskId: id,
            content: `Task name and description updated: ${content.name}`,
          },
        });
      } else {
        await prisma.activity.create({
          data: {
            taskId: id,
            content: `Task name updated: ${content.name}`,
          },
        });
      }
    } else if (content.description !== task.description) {
      await prisma.activity.create({
        data: {
          taskId: id,
          content: `Task description updated: ${content.description}`,
        },
      });
    } else {
      return task;
    }

    const updated = await prisma.task.update({
      where: { id },
      data: { ...content },
    });

    return updated;
  } else if (!task) {
    throw new Error(`Task ${id} not found`);
  } else {
    throw new Error(`Task ${id} could not be updated`);
  }
};

export const deleteTask = async (id: string) => {
  const task = await prisma.task.delete({
    where: { id },
  });

  if (task) {
    const group = await prisma.group.findFirst({
      where: { id: task.groupId },
    });

    if (group) {
      const updated = await prisma.group.update({
        where: { id: task.groupId },
        data: {
          taskOrder: group.taskOrder.filter((taskId) => taskId !== id),
        },
      });

      if (updated) {
        return {
          task,
          group: updated,
        };
      } else {
        throw new Error(`Task could not be deleted`);
      }
    } else {
      throw new Error(`Task's group ${task.groupId} not found`);
    }
  } else {
    throw new Error(`Task ${id} not found`);
  }
};
