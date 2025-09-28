<script lang="ts">
	import type { Project } from '../types.js';
	import { formatTime } from '../utils/time.js';

	export let project: Project;
	export let onDelete: (id: string) => void;

	function handleDelete() {
		onDelete(project.id);
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
				</div>
			</div>
		</div>
		<button
			on:click={handleDelete}
			class="ml-4 p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-md transition-colors"
			title="Delete project"
			aria-label="Delete project"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
			</svg>
		</button>
	</div>
</div>