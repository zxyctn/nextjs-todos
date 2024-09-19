import { NextRequest } from 'next/server';

import {
  selectWorkspace,
  updateWorkspaceName,
  deleteWorkspace,
} from '@/lib/db';
import { getSession } from '@/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();

  if (!session) {
    throw new Error(`Session could not be found`);
  }

  const { workspaces, selected } = await selectWorkspace(
    params.id,
    session.user.id
  );

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
  const session = await getSession();

  if (!session) {
    throw new Error(`Session could not be found`);
  }

  const { workspaces, selected } = await deleteWorkspace(
    params.id,
    session.user.id
  );

  return Response.json({ workspaces, selected });
}
