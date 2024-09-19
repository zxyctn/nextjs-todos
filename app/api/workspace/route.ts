import { NextRequest } from 'next/server';

import { getWorkspaces, createWorkspace } from '@/lib/db';
import { getSession } from '@/auth';

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    throw new Error(`Session could not be found`);
  }

  const workspaces = await getWorkspaces(session.user.id);

  return Response.json(workspaces);
}

export async function POST(request: NextRequest) {
  const { name } = await request.json();

  const session = await getSession();

  if (!session) {
    throw new Error(`Session could not be found`);
  }

  const { selected, workspaces } = await createWorkspace(name, session.user.id);
  return Response.json({ selected, workspaces });
}
