import { updateTaskGroup, updateTaskName } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const data = await request.json();
  let task;

  if (Object.keys(data).includes('groupId')) {
    task = await updateTaskGroup(params.id, data.groupId);
  } else if (Object.keys(data).includes('name')) {
    task = await updateTaskName(params.id, data.name);
  }

  return Response.json(task);
}
