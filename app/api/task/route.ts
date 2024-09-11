import { NextRequest } from 'next/server';

import { createTask } from '@/lib/db';

export async function POST(request: NextRequest) {
  const data = await request.json();
  const { groupId, name, description } = data;

  const { task, group } = await createTask(groupId, name, description);

  return Response.json({ task, group });
}
