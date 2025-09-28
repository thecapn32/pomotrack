export interface Project {
	id: string;
	name: string;
	description: string;
	color: string;
	createdAt: Date;
	totalMinutes: number;
}

export interface NewProject {
	name: string;
	description: string;
	color: string;
}

export type TabType = 'overview' | 'timer' | 'stats';