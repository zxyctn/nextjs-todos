import { NextRequest } from 'next/server';

import {
  selectWorkspace,
  updateWorkspaceName,
  deleteWorkspace,
} from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { workspaces, selected } = await selectWorkspace(params.id);

  return Response.json({ workspaces, selected });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const data = await request.json();
  const workspace = await updateWorkspaceName(params.id, data.name);

  return Response.json(workspace);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { workspaces, selected } = await deleteWorkspace(params.id);

  return Response.json({ workspaces, selected });
}
