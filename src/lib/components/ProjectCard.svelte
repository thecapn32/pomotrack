<script lang="ts">
	import type { ProjectWithTasks } from '../types.js';
	import { formatTime } from '../utils/time.js';

	export let project: ProjectWithTasks;
	export let onDelete: (id: string) => void;
	export let onAddTask: (projectId: string) => void;
	export let onToggleTask: (projectId: string, taskId: string) => void;
	export let onDeleteTask: (projectId: string, taskId: string) => void;

	function handleDelete() {
		onDelete(project.id);
	}

	function handleAddTask() {
		onAddTask(project.id);
	}

	function handleToggleTask(taskId: string) {
		onToggleTask(project.id, taskId);
	}

	function handleDeleteTask(taskId: string) {
		onDeleteTask(project.id, taskId);
	}
</script>

<div class="bg-gray-700 border border-gray-600 rounded-lg p-4 mb-3 hover:bg-gray-650 hover:border-gray-500 transition-all">
	<div class="flex justify-between items-start">
		<div class="flex items-start space-x-3 flex-1">
			<div
				class="w-4 h-4 rounded-full flex-shrink-0 mt-1 border border-gray-500"
				style="background-color: {project.color}"
				title="Project color: {project.color}"
			></div>
			<div class="flex-1">
				<h4 class="text-lg font-medium text-gray-100">{project.name}</h4>
				{#if project.description}
					<p class="text-gray-300 mt-1">{project.description}</p>
				{/if}
				<div class="flex items-center mt-2 text-sm text-gray-400">
					<span>Created: {project.createdAt.toLocaleDateString()}</span>
					<span class="mx-2">•</span>
					<span>Time spent: {formatTime(project.totalMinutes)}</span>
					<span class="mx-2">•</span>
					<span>{project.tasks.length} task{project.tasks.length === 1 ? '' : 's'}</span>
				</div>

				<!-- Tasks List -->
				{#if project.tasks.length > 0}
					<div class="mt-4 space-y-2">
						<h5 class="text-sm font-medium text-gray-300">Tasks:</h5>
						{#each project.tasks as task (task.id)}
							<div class="flex items-center space-x-3 py-2 px-3 bg-gray-800 rounded-md border border-gray-600">
								<button
									class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800
									{task.status === 'suspend' ? 'border-gray-500 bg-gray-600' :
									 task.status === 'active' ? 'border-blue-400 bg-blue-500' :
									 'border-green-400 bg-green-500'}"
									on:click={() => handleToggleTask(task.id)}
									title="Status: {task.status}"
								>
									{#if task.status === 'suspend'}
										<!-- Pause icon -->
										<svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
											<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
										</svg>
									{:else if task.status === 'active'}
										<!-- Play icon -->
										<svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
											<path d="M8 5v14l11-7z"/>
										</svg>
									{:else}
										<!-- Check icon -->
										<svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
											<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
										</svg>
									{/if}
								</button>
								<div class="flex-1">
									<div class="flex items-center justify-between">
										<span class="text-sm text-gray-200 {task.status === 'completed' ? 'line-through opacity-60' : task.status === 'suspend' ? 'opacity-60' : ''}">{task.name}</span>
										<div class="flex items-center space-x-2">
											<span class="text-xs text-gray-400">{formatTime(task.timeSpent)}</span>
											<button
												on:click={() => handleDeleteTask(task.id)}
												class="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
												title="Delete task"
												aria-label="Delete task"
											>
												<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
												</svg>
											</button>
										</div>
									</div>
									{#if task.description}
										<p class="text-xs text-gray-400 mt-1">{task.description}</p>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
		<div class="flex items-center space-x-2 ml-4">
			<button
				on:click={handleAddTask}
				class="p-2 text-green-400 hover:text-green-300 hover:bg-green-900/20 rounded-md transition-colors"
				title="Add task"
				aria-label="Add task to project"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
				</svg>
			</button>
			<button
				on:click={handleDelete}
				class="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-md transition-colors"
				title="Delete project"
				aria-label="Delete project"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
				</svg>
			</button>
		</div>
	</div>
</div>