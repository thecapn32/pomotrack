import { eq, desc } from 'drizzle-orm';
import { db, projects, tasks, timeSessions } from './index';
import type { Project, NewProject, Task, NewTask, TimeSession, NewTimeSession } from './schema';

// Project operations
export const projectService = {
  // Get all projects with their tasks
  async getAll(): Promise<(Project & { tasks: Task[] })[]> {
    const allProjects = await db.select().from(projects).orderBy(desc(projects.createdAt));
    const allTasks = await db.select().from(tasks);

    return allProjects.map(project => ({
      ...project,
      tasks: allTasks.filter(task => task.projectId === project.id)
    }));
  },

  // Get a single project by ID
  async getById(id: string): Promise<Project | null> {
    const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return result[0] || null;
  },

  // Create a new project
  async create(newProject: NewProject): Promise<Project> {
    const result = await db.insert(projects).values(newProject).returning();
    return result[0];
  },

  // Update a project
  async update(id: string, updates: Partial<NewProject>): Promise<Project | null> {
    const result = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return result[0] || null;
  },

  // Delete a project (cascades to tasks and time sessions)
  async delete(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return result.changes > 0;
  }
};

// Task operations
export const taskService = {
  // Get all tasks for a project
  async getByProjectId(projectId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, projectId))
      .orderBy(desc(tasks.createdAt));
  },

  // Get a single task by ID
  async getById(id: string): Promise<Task | null> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return result[0] || null;
  },

  // Create a new task
  async create(newTask: NewTask): Promise<Task> {
    const result = await db.insert(tasks).values(newTask).returning();
    return result[0];
  },

  // Update a task
  async update(id: string, updates: Partial<NewTask>): Promise<Task | null> {
    const result = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return result[0] || null;
  },

  // Toggle task status through three states: suspend -> active -> completed -> suspend
  async toggleStatus(id: string): Promise<Task | null> {
    const task = await this.getById(id);
    if (!task) return null;

    let newStatus: string;
    let completedAt: Date | null = null;

    switch (task.status) {
      case 'suspend':
        newStatus = 'active';
        break;
      case 'active':
        newStatus = 'completed';
        completedAt = new Date();
        break;
      case 'completed':
        newStatus = 'suspend';
        break;
      default:
        newStatus = 'active';
    }

    return await this.update(id, {
      status: newStatus,
      completedAt: newStatus === 'completed' ? completedAt : null
    });
  },

  // Add time to a task
  async addTime(id: string, minutes: number): Promise<Task | null> {
    const task = await this.getById(id);
    if (!task) return null;

    return await this.update(id, {
      timeSpent: task.timeSpent + minutes
    });
  },

  // Delete a task
  async delete(id: string): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return result.changes > 0;
  }
};

// Time session operations
export const timeSessionService = {
  // Get all time sessions for a task
  async getByTaskId(taskId: string): Promise<TimeSession[]> {
    return await db
      .select()
      .from(timeSessions)
      .where(eq(timeSessions.taskId, taskId))
      .orderBy(desc(timeSessions.startedAt));
  },

  // Create a new time session
  async create(newSession: NewTimeSession): Promise<TimeSession> {
    const result = await db.insert(timeSessions).values(newSession).returning();

    // Update task time_spent
    await taskService.addTime(newSession.taskId, newSession.durationMinutes);

    return result[0];
  },

  // Delete a time session
  async delete(id: string): Promise<boolean> {
    const session = await db.select().from(timeSessions).where(eq(timeSessions.id, id)).limit(1);
    if (!session[0]) return false;

    // Remove time from task
    await taskService.addTime(session[0].taskId, -session[0].durationMinutes);

    const result = await db.delete(timeSessions).where(eq(timeSessions.id, id));
    return result.changes > 0;
  }
};