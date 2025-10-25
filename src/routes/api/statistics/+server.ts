import { json } from '@sveltejs/kit';
import { db, projects, tasks, timeSessions } from '$lib/db';
import { eq, gte, sql } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const days = parseInt(url.searchParams.get('days') || '14');

		// Calculate the start date (e.g., 14 days ago)
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);
		startDate.setHours(0, 0, 0, 0);

		// Fetch all time sessions from the last N days with their associated tasks and projects
		const sessions = await db
			.select({
				sessionId: timeSessions.id,
				durationMinutes: timeSessions.durationMinutes,
				startedAt: timeSessions.startedAt,
				endedAt: timeSessions.endedAt,
				taskId: tasks.id,
				taskName: tasks.name,
				projectId: projects.id,
				projectName: projects.name,
				projectColor: projects.color
			})
			.from(timeSessions)
			.innerJoin(tasks, eq(timeSessions.taskId, tasks.id))
			.innerJoin(projects, eq(tasks.projectId, projects.id))
			.where(gte(timeSessions.startedAt, startDate))
			.orderBy(timeSessions.startedAt);

		// Group by date and project
		const dailyData: Record<string, Record<string, { minutes: number; color: string; name: string }>> = {};

		// Initialize all dates in the range
		for (let i = 0; i < days; i++) {
			const date = new Date(startDate);
			date.setDate(date.getDate() + i);
			const dateKey = date.toISOString().split('T')[0];
			dailyData[dateKey] = {};
		}

		// Aggregate session data
		sessions.forEach((session) => {
			const sessionDate = new Date(session.startedAt);
			const dateKey = sessionDate.toISOString().split('T')[0];

			if (!dailyData[dateKey]) {
				dailyData[dateKey] = {};
			}

			if (!dailyData[dateKey][session.projectId]) {
				dailyData[dateKey][session.projectId] = {
					minutes: 0,
					color: session.projectColor,
					name: session.projectName
				};
			}

			dailyData[dateKey][session.projectId].minutes += session.durationMinutes;
		});

		// Get all unique projects from the sessions
		const projectsMap = new Map<string, { name: string; color: string }>();
		sessions.forEach((session) => {
			if (!projectsMap.has(session.projectId)) {
				projectsMap.set(session.projectId, {
					name: session.projectName,
					color: session.projectColor
				});
			}
		});

		// Format response
		const response = {
			dailyData,
			projects: Array.from(projectsMap.entries()).map(([id, data]) => ({
				id,
				name: data.name,
				color: data.color
			})),
			dateRange: {
				start: startDate.toISOString(),
				end: new Date().toISOString(),
				days
			}
		};

		return json(response);
	} catch (error) {
		console.error('Failed to fetch statistics:', error);
		return json({ error: 'Failed to fetch statistics' }, { status: 500 });
	}
};
