import {
  getWorkspaces,
  createWorkspace,
  updateWorkspaceName,
  updateWorkspaceGroupOrder,
  deleteWorkspace,
  selectWorkspace,
} from '@/lib/db';

export const dynamic = 'force-static';

export async function GET() {
  const workspaces = await getWorkspaces('1'); // TODO: replace with actual user id

  return Response.json(workspaces);
}

export async function POST(req: Request) {
  const { name } = await req.json();

  const { selected, workspaces } = await createWorkspace(name);
  return Response.json({ selected, workspaces });
}
