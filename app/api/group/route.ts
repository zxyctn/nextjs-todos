import { NextRequest } from 'next/server';

import { createGroup } from '@/lib/db';

export async function POST(request: NextRequest) {
  const data = await request.json();
  const { workspaceId, name } = data;

  const { group, workspace } = await createGroup(workspaceId, name);

  return Response.json({ group, workspace });
}
