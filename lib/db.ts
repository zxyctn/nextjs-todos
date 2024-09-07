import prisma from './prisma';

export const getWorkspaces = async (userId: string) => {
  const workspaces = await prisma.workspace.findMany({
    where: { userId, selected: false }, // TODO: replace with actual user id
  });

  const selected = await prisma.workspace.findFirst({
    where: { userId, selected: true },
    include: {
      groups: {
        include: { tasks: { include: { activities: true } } },
      },
    },
  });

  return [selected, ...workspaces];
};

export const selectWorkspace = async (id: string) => {
  const workspace = await prisma.workspace.findFirst({
    where: { id },
    include: {
      groups: { include: { tasks: { include: { activities: true } } } },
    },
  });

  await prisma.workspace.update({
    where: { id },
    data: { selected: true },
  });

  await prisma.workspace.updateMany({
    where: { id: { not: id }, userId: '1' }, // TODO: replace with actual user id
    data: { selected: false },
  });

  return workspace;
};

export const createWorkspace = async (name: string) => {
  const workspace = await prisma.workspace.create({
    data: {
      name,
      selected: true,
      userId: '1', // TODO: replace with actual user id
    },
  });

  return workspace;
};

export const deleteWorkspace = async (id: string) => {
  const workspace = await prisma.workspace.delete({
    where: { id },
  });

  return workspace;
};

export const updateWorkspace = async (id: string, name: string) => {
  const workspace = await prisma.workspace.update({
    where: { id },
    data: { name },
    include: {
      groups: { include: { tasks: { include: { activities: true } } } },
    },
  });

  return workspace;
};

export const updateGroupTaskOrder = async (id: string, taskOrder: number[]) => {
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
