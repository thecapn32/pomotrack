import { writable } from 'svelte/store';
import type { ProjectWithTasks, NewProject, NewTask } from '../types';

function createProjectStore() {
	const { subscribe, set, update } = writable<ProjectWithTasks[]>([]);

	// API call helper
	async function apiCall(url: string, options: RequestInit = {}) {
		const response = await fetch(url, {
			headers: {
				'Content-Type': 'application/json',
				...options.headers
			},
			...options
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'API call failed');
		}

		return response.json();
	}

	// Load projects from API
	async function loadProjects() {
		try {
			console.log('Loading projects from API...');
			const projects = await apiCall('/api/projects');
			console.log('Loaded projects:', projects);

			// Convert database timestamps to Date objects for consistency
			const projectsWithDates = projects.map((project: any) => ({
				...project,
				createdAt: new Date(project.createdAt),
				updatedAt: new Date(project.updatedAt),
				tasks: project.tasks.map((task: any) => ({
					...task,
					createdAt: new Date(task.createdAt),
					updatedAt: new Date(task.updatedAt),
					completedAt: task.completedAt ? new Date(task.completedAt) : null
				}))
			}));
			console.log('Processed projects:', projectsWithDates);
			set(projectsWithDates);
		} catch (error) {
			console.error('Failed to load projects:', error);
		}
	}

	return {
		subscribe,

		// Initialize store by loading from API
		init: loadProjects,

		// Add a new project
		add: async (newProject: NewProject) => {
			try {
				const project = await apiCall('/api/projects', {
					method: 'POST',
					body: JSON.stringify(newProject)
				});

				const projectWithTasks: ProjectWithTasks = {
					...project,
					createdAt: new Date(project.createdAt),
					updatedAt: new Date(project.updatedAt),
					tasks: []
				};

				update(projects => [...projects, projectWithTasks]);
			} catch (error) {
				console.error('Failed to add project:', error);
			}
		},

		// Remove a project
		remove: async (id: string) => {
			try {
				await apiCall(`/api/projects?id=${id}`, {
					method: 'DELETE'
				});
				update(projects => projects.filter(p => p.id !== id));
			} catch (error) {
				console.error('Failed to remove project:', error);
			}
		},

		// Add time to a project (updates total minutes)
		addTime: async (id: string, minutes: number) => {
			try {
				// Update local state immediately for better UX
				update(projects =>
					projects.map(p =>
						p.id === id ? { ...p, totalMinutes: p.totalMinutes + minutes } : p
					)
				);
			} catch (error) {
				console.error('Failed to add time to project:', error);
			}
		},

		// Set total time for a project
		setTime: async (id: string, minutes: number) => {
			try {
				// Update local state immediately for better UX
				update(projects =>
					projects.map(p =>
						p.id === id ? { ...p, totalMinutes: minutes } : p
					)
				);
			} catch (error) {
				console.error('Failed to set project time:', error);
			}
		},

		// Add a task to a project
		addTask: async (newTask: NewTask) => {
			try {
				const task = await apiCall('/api/tasks', {
					method: 'POST',
					body: JSON.stringify(newTask)
				});

				const taskWithDates = {
					...task,
					createdAt: new Date(task.createdAt),
					updatedAt: new Date(task.updatedAt),
					completedAt: task.completedAt ? new Date(task.completedAt) : null
				};

				update(projects =>
					projects.map(p =>
						p.id === newTask.projectId
							? { ...p, tasks: [...p.tasks, taskWithDates] }
							: p
					)
				);
			} catch (error) {
				console.error('Failed to add task:', error);
			}
		},

		// Remove a task from a project
		removeTask: async (projectId: string, taskId: string) => {
			try {
				await apiCall(`/api/tasks?id=${taskId}`, {
					method: 'DELETE'
				});
				update(projects =>
					projects.map(p =>
						p.id === projectId
							? { ...p, tasks: p.tasks.filter(t => t.id !== taskId) }
							: p
					)
				);
			} catch (error) {
				console.error('Failed to remove task:', error);
			}
		},

		// Toggle task completion status
		toggleTask: async (projectId: string, taskId: string) => {
			try {
				const updatedTask = await apiCall(`/api/tasks?id=${taskId}`, {
					method: 'PATCH',
					body: JSON.stringify({ action: 'toggle' })
				});

				if (updatedTask) {
					const taskWithDates = {
						...updatedTask,
						createdAt: new Date(updatedTask.createdAt),
						updatedAt: new Date(updatedTask.updatedAt),
						completedAt: updatedTask.completedAt ? new Date(updatedTask.completedAt) : null
					};

					update(projects =>
						projects.map(p =>
							p.id === projectId
								? {
									...p,
									tasks: p.tasks.map(t =>
										t.id === taskId ? taskWithDates : t
									)
								}
								: p
						)
					);
				}
			} catch (error) {
				console.error('Failed to toggle task:', error);
			}
		},

		// Add time to a task (and update project total)
		addTaskTime: async (projectId: string, taskId: string, minutes: number) => {
			try {
				const updatedTask = await apiCall(`/api/tasks?id=${taskId}`, {
					method: 'PATCH',
					body: JSON.stringify({ action: 'addTime', minutes })
				});

				if (updatedTask) {
					// Update local state
					update(projects =>
						projects.map(p =>
							p.id === projectId
								? {
									...p,
									tasks: p.tasks.map(t =>
										t.id === taskId
											? { ...t, timeSpent: t.timeSpent + minutes }
											: t
									),
									totalMinutes: p.totalMinutes + minutes
								}
								: p
						)
					);
				}
			} catch (error) {
				console.error('Failed to add task time:', error);
			}
		}
	};
}

export const projects = createProjectStore();