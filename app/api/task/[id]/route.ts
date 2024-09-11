import { updateTaskGroup, updateTaskContent, deleteTask } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const data = await request.json();
  let task;

  if (Object.keys(data).includes('groupId')) {
    task = await updateTaskGroup(params.id, data.index, data.groupId);
  } else if (
    Object.keys(data).includes('name') ||
    Object.keys(data).includes('description')
  ) {
    task = await updateTaskContent(params.id, data);
  }

  return Response.json(task);
}

export async function DELETE({ params }: { params: { id: string } }) {
  const { task, group } = await deleteTask(params.id);

  return Response.json({ task, group });
}
