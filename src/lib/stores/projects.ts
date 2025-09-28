import { writable } from 'svelte/store';
import type { Project, NewProject } from '../types.js';

function createProjectStore() {
	const { subscribe, update } = writable<Project[]>([]);

	return {
		subscribe,
		add: (newProject: NewProject) => {
			const project: Project = {
				id: crypto.randomUUID(),
				name: newProject.name.trim(),
				description: newProject.description.trim(),
				color: newProject.color,
				createdAt: new Date(),
				totalMinutes: 0
			};

			update(projects => [...projects, project]);
		},
		remove: (id: string) => {
			update(projects => projects.filter(p => p.id !== id));
		},
		addTime: (id: string, minutes: number) => {
			update(projects =>
				projects.map(p =>
					p.id === id ? { ...p, totalMinutes: p.totalMinutes + minutes } : p
				)
			);
		},
		setTime: (id: string, minutes: number) => {
			update(projects =>
				projects.map(p =>
					p.id === id ? { ...p, totalMinutes: minutes } : p
				)
			);
		}
	};
}

export const projects = createProjectStore();