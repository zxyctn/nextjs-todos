import prisma from './prisma';

export const getWorkspaces = async (userId: string) => {
  const workspaces = await prisma.workspace.findMany({
    where: { userId }, // TODO: replace with actual user id
    orderBy: { selected: 'desc' },
  });
  return workspaces;
};

export const selectWorkspace = async (id: string) => {
  const workspace = await prisma.workspace.findFirst({
    where: { id },
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
  });

  return workspace;
};
