import { NextRequest } from 'next/server';

import {
  selectWorkspace,
  updateWorkspaceGroupOrder,
  updateWorkspaceName,
} from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const workspace = await selectWorkspace(params.id);

  return Response.json(workspace);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const data = await request.json();
  let workspace;

  if (Object.keys(data).includes('groupOrder')) {
    workspace = await updateWorkspaceGroupOrder(params.id, data.groupOrder);
  } else if (Object.keys(data).includes('name')) {
    workspace = await updateWorkspaceName(params.id, data.name);
  }

  return Response.json(workspace);
}
