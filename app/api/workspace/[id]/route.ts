import { NextRequest } from 'next/server';

import { selectWorkspace } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const workspace = await selectWorkspace(params.id);

  return Response.json(workspace);
}
