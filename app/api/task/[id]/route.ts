import { updateTaskGroup, updateTaskContent } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const data = await request.json();
  let task;

  if (Object.keys(data).includes('groupId')) {
    task = await updateTaskGroup(params.id, data.groupId);
  } else if (
    Object.keys(data).includes('name') ||
    Object.keys(data).includes('description')
  ) {
    task = await updateTaskContent(params.id, data);
  }

  return Response.json(task);
}
