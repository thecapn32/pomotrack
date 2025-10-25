<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import type { ProjectWithTasks } from '../types.js';
	import { formatTime } from '../utils/time.js';

	export let projects: ProjectWithTasks[];
	export let onSessionComplete: (projectId: string, taskId: string, minutes: number) => void;

	// Timer states
	let selectedProjectId = '';
	let selectedTaskId = '';
	let isRunning = false;
	let isPaused = false;
	let timeRemaining = 25 * 60; // 25 minutes in seconds
	let sessionType: 'work' | 'shortBreak' | 'longBreak' = 'work';
	let sessionsCompleted = 0;
	let intervalId: number | null = null;
	let sessionStartTime: number | null = null;

	// Timer durations (in seconds)
	const WORK_DURATION = 25 * 60; // 25 minutes
	const SHORT_BREAK_DURATION = 5 * 60; // 5 minutes
	const LONG_BREAK_DURATION = 15 * 60; // 15 minutes
	const SESSIONS_BEFORE_LONG_BREAK = 4;

	// Computed values
	$: selectedProject = projects.find(p => p.id === selectedProjectId);
	$: availableTasks = selectedProject?.tasks.filter(t => t.status === 'active') || [];
	$: selectedTask = availableTasks.find(t => t.id === selectedTaskId);
	$: progress = sessionType === 'work'
		? ((WORK_DURATION - timeRemaining) / WORK_DURATION) * 100
		: sessionType === 'shortBreak'
		? ((SHORT_BREAK_DURATION - timeRemaining) / SHORT_BREAK_DURATION) * 100
		: ((LONG_BREAK_DURATION - timeRemaining) / LONG_BREAK_DURATION) * 100;
	$: canStart = sessionType === 'work'
		? (selectedProjectId && selectedTaskId && !isRunning)
		: !isRunning;
	$: displayTime = formatTimeDisplay(timeRemaining);

	function formatTimeDisplay(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}

	// Timer state persistence functions
	function saveTimerState() {
		if (!browser) return;

		const state = {
			selectedProjectId,
			selectedTaskId,
			isRunning,
			isPaused,
			timeRemaining,
			sessionType,
			sessionsCompleted,
			sessionStartTime,
			timestamp: Date.now()
		};

		localStorage.setItem('pomodoroTimer', JSON.stringify(state));
	}

	function restoreTimerState() {
		if (!browser) return;

		try {
			const saved = localStorage.getItem('pomodoroTimer');
			if (!saved) return;

			const state = JSON.parse(saved);

			// Validate state structure and values
			if (!state || typeof state !== 'object') return;

			// Check if saved state is not too old (max 24 hours)
			const maxAge = 24 * 60 * 60 * 1000; // 24 hours
			if (Date.now() - state.timestamp > maxAge) {
				clearTimerState();
				return;
			}

			// Restore basic state
			selectedProjectId = state.selectedProjectId || '';
			selectedTaskId = state.selectedTaskId || '';
			sessionType = ['work', 'shortBreak', 'longBreak'].includes(state.sessionType) ? state.sessionType : 'work';
			sessionsCompleted = typeof state.sessionsCompleted === 'number' ? state.sessionsCompleted : 0;

			// Handle running timer state
			if (state.isRunning && state.sessionStartTime) {
				const elapsedTime = Math.floor((Date.now() - state.sessionStartTime) / 1000);
				const originalDuration = sessionType === 'work' ? WORK_DURATION
					: sessionType === 'shortBreak' ? SHORT_BREAK_DURATION
					: LONG_BREAK_DURATION;

				timeRemaining = Math.max(0, originalDuration - elapsedTime);

				if (timeRemaining > 0) {
					// Resume the timer
					isRunning = true;
					isPaused = false;
					sessionStartTime = state.sessionStartTime;
					startTimer();
				} else {
					// Session should have completed while away
					handleMissedCompletion();
				}
			} else if (state.isPaused) {
				// Restore paused state
				timeRemaining = typeof state.timeRemaining === 'number' ? state.timeRemaining : getDefaultDuration();
				isPaused = true;
				isRunning = false;
			} else {
				// Restore stopped state
				timeRemaining = getDefaultDuration();
				isRunning = false;
				isPaused = false;
			}
		} catch (error) {
			console.error('Failed to restore timer state:', error);
			clearTimerState();
		}
	}

	function clearTimerState() {
		if (!browser) return;
		localStorage.removeItem('pomodoroTimer');
	}

	function getDefaultDuration(): number {
		return sessionType === 'work' ? WORK_DURATION
			: sessionType === 'shortBreak' ? SHORT_BREAK_DURATION
			: LONG_BREAK_DURATION;
	}

	function handleMissedCompletion() {
		// Handle case where session completed while user was away
		if (sessionType === 'work') {
			sessionsCompleted++;
			const workMinutes = WORK_DURATION / 60;
			if (selectedProjectId && selectedTaskId) {
				onSessionComplete(selectedProjectId, selectedTaskId, workMinutes);
			}

			// Move to break
			if (sessionsCompleted % SESSIONS_BEFORE_LONG_BREAK === 0) {
				sessionType = 'longBreak';
				timeRemaining = LONG_BREAK_DURATION;
			} else {
				sessionType = 'shortBreak';
				timeRemaining = SHORT_BREAK_DURATION;
			}
		} else {
			// Break completed, back to work
			sessionType = 'work';
			timeRemaining = WORK_DURATION;
		}

		isRunning = false;
		isPaused = false;
		sessionStartTime = null;
		saveTimerState();
	}

	function startTimer() {
		// Only require project/task selection for work sessions
		if (sessionType === 'work' && (!selectedProjectId || !selectedTaskId)) return;

		isRunning = true;
		isPaused = false;
		sessionStartTime = Date.now() - ((getDefaultDuration() - timeRemaining) * 1000);

		saveTimerState();

		intervalId = setInterval(() => {
			timeRemaining--;
			saveTimerState();

			if (timeRemaining <= 0) {
				completeSession();
			}
		}, 1000);
	}

	function pauseTimer() {
		isPaused = true;
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
		sessionStartTime = null;
		saveTimerState();
	}

	function resumeTimer() {
		isPaused = false;
		startTimer();
	}

	function stopTimer() {
		isRunning = false;
		isPaused = false;
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
		sessionStartTime = null;
		resetTimer();
		saveTimerState();
	}

	function completeSession() {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}

		if (sessionType === 'work') {
			// Record completed work session
			sessionsCompleted++;
			const workMinutes = WORK_DURATION / 60;

			// Only record time if project and task are selected
			if (selectedProjectId && selectedTaskId) {
				onSessionComplete(selectedProjectId, selectedTaskId, workMinutes);
			}

			// Determine next session type
			if (sessionsCompleted % SESSIONS_BEFORE_LONG_BREAK === 0) {
				sessionType = 'longBreak';
				timeRemaining = LONG_BREAK_DURATION;
			} else {
				sessionType = 'shortBreak';
				timeRemaining = SHORT_BREAK_DURATION;
			}
		} else {
			// Break is complete, back to work
			sessionType = 'work';
			timeRemaining = WORK_DURATION;
		}

		isRunning = false;
		isPaused = false;
		sessionStartTime = null;

		// Save state after completion
		saveTimerState();

		// Show completion notification
		showNotification();
	}

	function resetTimer() {
		sessionType = 'work';
		timeRemaining = WORK_DURATION;
		saveTimerState();
	}

	function showNotification() {
		if ('Notification' in window && Notification.permission === 'granted') {
			const message = sessionType === 'work'
				? 'Work session completed! Time for a break.'
				: 'Break time is over! Ready for another work session?';
			new Notification('PomoTrack', { body: message });
		}
	}

	function requestNotificationPermission() {
		if ('Notification' in window && Notification.permission === 'default') {
			Notification.requestPermission();
		}
	}

	onMount(() => {
		requestNotificationPermission();
		restoreTimerState();
	});

	onDestroy(() => {
		if (intervalId) {
			clearInterval(intervalId);
		}
	});

	// Reset task selection when project changes
	$: if (selectedProjectId) {
		selectedTaskId = '';
		if (browser) saveTimerState();
	}

	// Save state when task selection changes
	$: if (selectedTaskId && browser) {
		saveTimerState();
	}
</script>

<div class="max-w-2xl mx-auto p-6">
	<!-- Session Info -->
	<div class="text-center mb-8">
		<h2 class="text-3xl font-bold text-gray-100 mb-2">
			{#if sessionType === 'work'}
				🍅 Work Session
			{:else if sessionType === 'shortBreak'}
				☕ Short Break
			{:else}
				🌱 Long Break
			{/if}
		</h2>
		<p class="text-gray-400">
			{#if sessionType === 'work'}
				Focus time • Sessions completed: {sessionsCompleted}
			{:else}
				Take a break • You've earned it!
			{/if}
		</p>
	</div>

	<!-- Project and Task Selection -->
	{#if sessionType === 'work'}
		<div class="bg-gray-700 rounded-lg p-6 mb-8">
			<h3 class="text-lg font-medium text-gray-100 mb-4">Select Project & Task</h3>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<!-- Project Selection -->
				<div>
					<label for="project-select" class="block text-sm font-medium text-gray-300 mb-2">
						Project
					</label>
					<select
						id="project-select"
						bind:value={selectedProjectId}
						disabled={isRunning}
						class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
					>
						<option value="">Select a project...</option>
						{#each projects as project (project.id)}
							<option value={project.id}>{project.name}</option>
						{/each}
					</select>
				</div>

				<!-- Task Selection -->
				<div>
					<label for="task-select" class="block text-sm font-medium text-gray-300 mb-2">
						Task
					</label>
					<select
						id="task-select"
						bind:value={selectedTaskId}
						disabled={isRunning || !selectedProjectId}
						class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
					>
						<option value="">Select a task...</option>
						{#each availableTasks as task (task.id)}
							<option value={task.id}>{task.name}</option>
						{/each}
					</select>
				</div>
			</div>

			{#if selectedProject && selectedTask}
				<div class="mt-4 p-3 bg-gray-600 rounded-md">
					<p class="text-sm text-gray-300">
						<span class="font-medium text-gray-100">{selectedProject.name}</span>
						<span class="text-gray-400 mx-2">→</span>
						<span class="text-gray-100">{selectedTask.name}</span>
					</p>
					{#if selectedTask.description}
						<p class="text-xs text-gray-400 mt-1">{selectedTask.description}</p>
					{/if}
				</div>
			{/if}
		</div>
	{/if}

	<!-- Timer Display -->
	<div class="text-center mb-8">
		<div class="relative inline-block">
			<!-- Circular Progress -->
			<svg class="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
				<!-- Background circle -->
				<circle
					cx="50"
					cy="50"
					r="45"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					class="text-gray-600"
				/>
				<!-- Progress circle -->
				<circle
					cx="50"
					cy="50"
					r="45"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-dasharray="283"
					stroke-dashoffset="{283 - (progress / 100) * 283}"
					class="{sessionType === 'work' ? 'text-red-500' : 'text-green-500'} transition-all duration-1000"
				/>
			</svg>

			<!-- Timer Text -->
			<div class="absolute inset-0 flex items-center justify-center">
				<div class="text-center">
					<div class="text-4xl font-mono font-bold text-gray-100">
						{displayTime}
					</div>
					<div class="text-sm text-gray-400 mt-1">
						{sessionType === 'work' ? 'minutes' : 'break time'}
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Timer Controls -->
	<div class="flex justify-center space-x-4 mb-6">
		{#if !isRunning && !isPaused}
			<button
				on:click={startTimer}
				disabled={!canStart}
				class="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
			>
				<svg class="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
					<path d="M8 5v14l11-7z"/>
				</svg>
				Start
			</button>
		{:else if isRunning && !isPaused}
			<button
				on:click={pauseTimer}
				class="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-800"
			>
				<svg class="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
					<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
				</svg>
				Pause
			</button>
		{:else if isPaused}
			<button
				on:click={resumeTimer}
				class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
			>
				<svg class="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
					<path d="M8 5v14l11-7z"/>
				</svg>
				Resume
			</button>
		{/if}

		{#if isRunning || isPaused}
			<button
				on:click={stopTimer}
				class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
			>
				<svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10h6v4H9z"/>
				</svg>
				Stop
			</button>
		{/if}
	</div>

	<!-- Session Stats -->
	<div class="bg-gray-700 rounded-lg p-4">
		<h4 class="font-medium text-gray-100 mb-3">Session Statistics</h4>
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
			<div>
				<div class="text-2xl font-bold text-blue-400">{sessionsCompleted}</div>
				<div class="text-xs text-gray-400">Completed</div>
			</div>
			<div>
				<div class="text-2xl font-bold text-green-400">{Math.floor(sessionsCompleted / 4)}</div>
				<div class="text-xs text-gray-400">Long Breaks</div>
			</div>
			<div>
				<div class="text-2xl font-bold text-yellow-400">{sessionsCompleted * 25}</div>
				<div class="text-xs text-gray-400">Minutes Focused</div>
			</div>
			<div>
				<div class="text-2xl font-bold text-red-400">
					{SESSIONS_BEFORE_LONG_BREAK - (sessionsCompleted % SESSIONS_BEFORE_LONG_BREAK)}
				</div>
				<div class="text-xs text-gray-400">Until Long Break</div>
			</div>
		</div>
	</div>
</div>