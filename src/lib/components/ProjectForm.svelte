<script lang="ts">
	import type { NewProject } from '../types.js';

	export let project: NewProject;
	export let onSubmit: (project: NewProject) => void;
	export let onCancel: () => void;

	function handleSubmit() {
		if (project.name.trim()) {
			onSubmit(project);
		}
	}

	function openColorPicker() {
		document.getElementById('project-color-input')?.click();
	}
</script>

<div class="space-y-5">
	<div>
		<label for="project-name" class="block text-sm font-medium text-gray-200 mb-2">
			Project Name
		</label>
		<input
			id="project-name"
			type="text"
			bind:value={project.name}
			placeholder="Enter project name..."
			class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
		/>
	</div>

	<div>
		<label for="project-description" class="block text-sm font-medium text-gray-200 mb-2">
			Description (optional)
		</label>
		<textarea
			id="project-description"
			bind:value={project.description}
			placeholder="Enter project description..."
			rows="3"
			class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
		></textarea>
	</div>

	<div>
		<label for="project-color-input" class="block text-sm font-medium text-gray-200 mb-3">
			Project Color
		</label>
		<div class="flex items-center space-x-4">
			<button
				type="button"
				class="w-12 h-12 rounded-full border-3 border-gray-600 cursor-pointer hover:border-gray-500 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
				style="background-color: {project.color}"
				title="Click to change color"
				aria-label="Change project color"
				on:click={openColorPicker}
			></button>
			<input
				id="project-color-input"
				type="color"
				bind:value={project.color}
				class="sr-only"
			/>
			<span class="text-sm text-gray-300">
				Click circle to change color
			</span>
			<span class="text-sm text-gray-400 font-mono">{project.color}</span>
		</div>
	</div>

	<div class="flex space-x-3 pt-6">
		<button
			on:click={onCancel}
			class="flex-1 px-4 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium"
		>
			Cancel
		</button>
		<button
			on:click={handleSubmit}
			disabled={!project.name.trim()}
			class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
		>
			Add Project
		</button>
	</div>
</div>