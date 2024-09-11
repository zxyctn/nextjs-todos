import { NextRequest } from 'next/server';

import { moveGroup, updateGroupName, deleteGroup } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const data = await request.json();
  let group;

  if (Object.keys(data).includes('index')) {
    group = await moveGroup(params.id, data.index);
  } else {
    group = await updateGroupName(params.id, data.name);
  }

  return Response.json(group);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { group, workspace } = await deleteGroup(params.id);

  return Response.json({ group, workspace });
}
