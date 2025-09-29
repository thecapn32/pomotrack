import { json } from '@sveltejs/kit';
import { taskService } from '$lib/db/service';
import type { RequestHandler } from './$types';

// POST /api/tasks - Create a new task
export const POST: RequestHandler = async ({ request }) => {
  try {
    const newTask = await request.json();
    const task = await taskService.create({
      id: crypto.randomUUID(),
      projectId: newTask.projectId,
      name: newTask.name.trim(),
      description: newTask.description?.trim() || null,
      status: 'active',
      timeSpent: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null
    });
    return json(task);
  } catch (error) {
    console.error('Failed to create task:', error);
    return json({ error: 'Failed to create task' }, { status: 500 });
  }
};

// DELETE /api/tasks - Delete a task
export const DELETE: RequestHandler = async ({ url }) => {
  try {
    const id = url.searchParams.get('id');
    if (!id) {
      return json({ error: 'Task ID is required' }, { status: 400 });
    }

    const success = await taskService.delete(id);
    return json({ success });
  } catch (error) {
    console.error('Failed to delete task:', error);
    return json({ error: 'Failed to delete task' }, { status: 500 });
  }
};

// PATCH /api/tasks - Update a task (toggle completion, add time, etc.)
export const PATCH: RequestHandler = async ({ request, url }) => {
  try {
    const id = url.searchParams.get('id');
    if (!id) {
      return json({ error: 'Task ID is required' }, { status: 400 });
    }

    const updates = await request.json();

    if (updates.action === 'toggle') {
      const task = await taskService.toggleStatus(id);
      return json(task);
    } else if (updates.action === 'addTime') {
      const task = await taskService.addTime(id, updates.minutes);
      return json(task);
    } else {
      const task = await taskService.update(id, updates);
      return json(task);
    }
  } catch (error) {
    console.error('Failed to update task:', error);
    return json({ error: 'Failed to update task' }, { status: 500 });
  }
};