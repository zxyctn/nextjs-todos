import { NextRequest } from 'next/server';

import { getWorkspaces, createWorkspace } from '@/lib/db';

export const dynamic = 'force-static';

export async function GET(request: NextRequest) {
  const workspaces = await getWorkspaces('1'); // TODO: replace with actual user id

  return Response.json(workspaces);
}

export async function POST(request: NextRequest) {
  const { name } = await request.json();

  const { selected, workspaces } = await createWorkspace(name);
  return Response.json({ selected, workspaces });
}
