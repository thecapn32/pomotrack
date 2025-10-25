import { json } from '@sveltejs/kit';
import { db, timeSessions } from '$lib/db';
import type { RequestHandler } from './$types';
import { randomUUID } from 'crypto';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { taskId, durationMinutes, startedAt, endedAt, notes } = body;

		if (!taskId || !durationMinutes) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		const newSession = {
			id: randomUUID(),
			taskId,
			durationMinutes: parseInt(durationMinutes),
			startedAt: startedAt ? new Date(startedAt) : new Date(Date.now() - durationMinutes * 60 * 1000),
			endedAt: endedAt ? new Date(endedAt) : new Date(),
			notes: notes || null
		};

		const [session] = await db.insert(timeSessions).values(newSession).returning();

		return json(session);
	} catch (error) {
		console.error('Failed to create time session:', error);
		return json({ error: 'Failed to create time session' }, { status: 500 });
	}
};
