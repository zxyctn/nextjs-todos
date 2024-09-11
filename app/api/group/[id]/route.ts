import { NextRequest } from 'next/server';

import { updateGroupTaskOrder, updateGroupName, deleteGroup } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const data = await request.json();
  let group;

  if (Object.keys(data).includes('taskOrder')) {
    group = await updateGroupTaskOrder(params.id, data.taskOrder);
  } else if (Object.keys(data).includes('name')) {
    group = await updateGroupName(params.id, data.name);
  }

  return Response.json(group);
}

export async function DELETE({ params }: { params: { id: string } }) {
  const { group, workspace } = await deleteGroup(params.id);

  return Response.json({ group, workspace });
}
