import {
  getWorkspaces,
  createWorkspace,
  updateWorkspace,
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

  const workspace = await createWorkspace(name);
  return Response.json(await selectWorkspace(workspace.id));
}

export async function PUT(req: Request) {
  const { id, name } = await req.json();

  const workspace = await updateWorkspace(id, name);

  return Response.json(await selectWorkspace(workspace.id));
}

export async function DELETE(req: Request) {
  const { id } = await req.json();

  const workspace = await deleteWorkspace(id);

  return Response.json(workspace);
}
