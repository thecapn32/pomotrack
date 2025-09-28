/**
 * Formats minutes into a human-readable time string
 * @param totalMinutes - Total minutes to format
 * @returns Formatted time string (e.g., "2h 30m", "45m", "0m")
 */
export function formatTime(totalMinutes: number): string {
	if (totalMinutes === 0) {
		return '0m';
	}

	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;

	if (hours === 0) {
		return `${minutes}m`;
	} else if (minutes === 0) {
		return `${hours}h`;
	} else {
		return `${hours}h ${minutes}m`;
	}
}

/**
 * Formats minutes into hours and minutes separately
 * @param totalMinutes - Total minutes to format
 * @returns Object with hours and minutes
 */
export function splitTime(totalMinutes: number): { hours: number; minutes: number } {
	return {
		hours: Math.floor(totalMinutes / 60),
		minutes: totalMinutes % 60
	};
}