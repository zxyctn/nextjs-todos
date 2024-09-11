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
      const all = await prisma.workspace.findMany({
        where: { userId: '1' }, // TODO: replace with actual user id
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
        workspaces: all,
        selected,
      };
    }
  }
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

  if (!workspaces) {
    throw new Error(`Workspaces could not be found`);
  } else {
    const selected = await prisma.workspace.findFirst({
      where: { userId, selected: true },
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
      const all = await prisma.workspace.findMany({
        where: { userId: '1' }, // TODO: replace with actual user id
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
        workspaces: all,
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

  if (!selected) {
    throw new Error(`Workspace ${id} could not be updated`);
  } else {
    return selected;
  }
};

export const deleteWorkspace = async (id: string) => {
  const workspace = await prisma.workspace.delete({
    where: { id, userId: '1' },
  });

  if (workspace.selected) {
    const first = await prisma.workspace.findFirst({
      where: { userId: '1' }, // TODO: replace with actual user id
    });

    if (first) {
      const selected = await prisma.workspace.update({
        where: { id: first.id },
        data: { selected: true },
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

      if (!selected) {
        throw new Error(`Workspace ${first.id} could not be selected`);
      }

      const workspaces = await prisma.workspace.updateMany({
        where: { id: { not: first.id }, userId: '1' }, // TODO: replace with actual user id
        data: { selected: false },
      });

      if (!workspaces) {
        throw new Error(`Workspaces could not be updated`);
      }

      const all = await prisma.workspace.findMany({
        where: { userId: '1' }, // TODO: replace with actual user id
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
        workspaces: all,
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
        tasks: {
          include: {
            activities: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (group) {
      const updated = await prisma.workspace.update({
        where: { id: workspaceId },
        data: { groupOrder: [...workspace.groupOrder, group.id] },
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

export const moveGroup = async (id: string, index: number) => {
  const group = await prisma.group.findFirst({
    where: { id },
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

  if (group) {
    const workspace = await prisma.workspace.findFirst({
      where: { id: group.workspaceId },
    });

    if (workspace) {
      const groupOrder = workspace.groupOrder.filter(
        (groupId) => groupId !== id
      );

      const updated = await prisma.workspace.update({
        where: { id: group.workspaceId },
        data: {
          groupOrder: [
            ...groupOrder.slice(0, index),
            id,
            ...groupOrder.slice(index),
          ],
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

      if (updated) {
        return {
          group,
          workspace: updated,
        };
      } else {
        throw new Error(`Group could not be moved`);
      }
    } else {
      throw new Error(`Workspace ${group.workspaceId} not found`);
    }
  } else {
    throw new Error(`Group ${id} not found`);
  }
};

export const updateGroupName = async (id: string, name: string) => {
  const group = await prisma.group.update({
    where: { id },
    data: { name },
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
    include: {
      activities: {
        orderBy: { createdAt: 'desc' },
      },
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

      if (updated) {
        const activity = await prisma.activity.create({
          data: {
            taskId: task.id,
            content: `Task created in group ${group.name}`,
          },
        });

        if (!activity) {
          throw new Error(`Task activity could not be created`);
        }

        return {
          task,
          group: updated,
          activity,
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

export const moveTask = async (id: string, index: number, groupId: string) => {
  const task = await prisma.task.findFirst({
    where: { id },
    include: {
      group: true,
    },
  });

  if (task) {
    const oldGroup = await prisma.group.update({
      where: { id: task.groupId },
      data: {
        taskOrder: task.group.taskOrder.filter((taskId) => taskId !== id),
      },
    });

    if (!oldGroup) {
      throw new Error(`Task could not be moved`);
    }

    const updated = await prisma.task.update({
      where: { id },
      data: { groupId },
      include: {
        group: true,
      },
    });

    if (!updated) {
      throw new Error(`Task could not be updated`);
    }

    const newGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        taskOrder: [
          ...updated.group.taskOrder.slice(0, index),
          id,
          ...updated.group.taskOrder.slice(index),
        ],
      },
    });

    if (!newGroup) {
      throw new Error(`Task could not be moved`);
    }

    const activity = await prisma.activity.create({
      data: {
        taskId: id,
        content: `Task moved to group ${updated.group.name}`,
      },
    });

    if (!activity) {
      throw new Error(`Task activity could not be created`);
    }

    return {
      task,
      activity,
    };
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

  let activity;

  if (task) {
    if (content.name !== task.name) {
      if (content.description !== task.description) {
        activity = await prisma.activity.create({
          data: {
            taskId: id,
            content: `Task name and description updated: ${content.name}`,
          },
        });
      } else {
        activity = await prisma.activity.create({
          data: {
            taskId: id,
            content: `Task name updated: ${content.name}`,
          },
        });
      }
    } else if (content.description !== task.description) {
      activity = await prisma.activity.create({
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

    return {
      task: updated,
      activity,
    };
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
