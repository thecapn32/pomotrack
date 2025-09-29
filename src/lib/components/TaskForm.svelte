<script lang="ts">
	import type { NewTask } from '../types.js';

	export let task: NewTask;
	export let onSubmit: (task: NewTask) => void;
	export let onCancel: () => void;
	export let projectName: string = '';

	function handleSubmit() {
		if (task.name.trim()) {
			onSubmit(task);
		}
	}
</script>

<div class="space-y-5">
	<div>
		<p class="text-sm text-gray-400 mb-4">
			Adding task to: <span class="font-medium text-gray-200">{projectName}</span>
		</p>
	</div>

	<div>
		<label for="task-name" class="block text-sm font-medium text-gray-200 mb-2">
			Task Name
		</label>
		<input
			id="task-name"
			type="text"
			bind:value={task.name}
			placeholder="Enter task name..."
			class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
		/>
	</div>

	<div>
		<label for="task-description" class="block text-sm font-medium text-gray-200 mb-2">
			Description (optional)
		</label>
		<textarea
			id="task-description"
			bind:value={task.description}
			placeholder="Enter task description..."
			rows="3"
			class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
		></textarea>
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
			disabled={!task.name.trim()}
			class="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
		>
			Add Task
		</button>
	</div>
</div>