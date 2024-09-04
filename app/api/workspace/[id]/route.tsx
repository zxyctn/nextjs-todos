import { selectWorkspace } from '@/lib/db';

export const dynamic = 'force-static';

export async function GET({ params }: { params: { id: string } }) {
  const workspace = await selectWorkspace(params.id);

  return Response.json(workspace);
}
