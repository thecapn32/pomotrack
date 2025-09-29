import { json } from '@sveltejs/kit';
import { projectService } from '$lib/db/service';
import type { RequestHandler } from './$types';

// GET /api/projects - Get all projects
export const GET: RequestHandler = async () => {
  try {
    const projects = await projectService.getAll();
    return json(projects);
  } catch (error) {
    console.error('Failed to get projects:', error);
    return json({ error: 'Failed to get projects' }, { status: 500 });
  }
};

// POST /api/projects - Create a new project
export const POST: RequestHandler = async ({ request }) => {
  try {
    const newProject = await request.json();
    const project = await projectService.create({
      id: crypto.randomUUID(),
      name: newProject.name.trim(),
      description: newProject.description?.trim() || null,
      color: newProject.color,
      totalMinutes: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return json(project);
  } catch (error) {
    console.error('Failed to create project:', error);
    return json({ error: 'Failed to create project' }, { status: 500 });
  }
};

// DELETE /api/projects - Delete a project
export const DELETE: RequestHandler = async ({ url }) => {
  try {
    const id = url.searchParams.get('id');
    if (!id) {
      return json({ error: 'Project ID is required' }, { status: 400 });
    }

    const success = await projectService.delete(id);
    return json({ success });
  } catch (error) {
    console.error('Failed to delete project:', error);
    return json({ error: 'Failed to delete project' }, { status: 500 });
  }
};