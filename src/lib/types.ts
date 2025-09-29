// Re-export database types for consistency
export type { Project as DbProject, Task as DbTask, TimeSession, NewTimeSession } from '$lib/db/schema';
import type { Task } from '$lib/db/schema';

// Task status type
export type TaskStatus = 'suspend' | 'active' | 'completed';

// UI-specific types for forms (without auto-generated fields)
export interface NewProject {
	name: string;
	description: string;
	color: string;
}

export interface NewTask {
	name: string;
	description: string;
	projectId: string;
}

// Extended Project type with tasks for UI
export interface ProjectWithTasks {
	id: string;
	name: string;
	description: string | null;
	color: string;
	totalMinutes: number;
	createdAt: Date;
	updatedAt: Date;
	tasks: Task[];
}

export type TabType = 'overview' | 'timer' | 'stats';