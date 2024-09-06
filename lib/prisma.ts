import { PrismaClient, Prisma } from '@prisma/client';

let prisma: PrismaClient;

export type TaskWithActivities = Prisma.TaskGetPayload<{
  include: {
    activities: true;
  };
}>;

export type GroupWithTasks = Prisma.GroupGetPayload<{
  include: {
    tasks: {
      include: {
        activities: true;
      };
    };
  };
}>;

export type WorkspaceWithGroups = Prisma.WorkspaceGetPayload<{
  include: {
    groups: {
      include: {
        tasks: {
          include: {
            activities: true;
          };
        };
      };
    };
  };
}>;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  let globalWithPrisma = global as typeof globalThis & {
    prisma: PrismaClient;
  };
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient();
  }
  prisma = globalWithPrisma.prisma;
}

export default prisma;
