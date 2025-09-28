<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	export let show: boolean = false;
	export let title: string = '';
	export let onClose: () => void;

	function handleBackdropClick() {
		onClose();
	}

	function handleContentClick(event: Event) {
		event.stopPropagation();
	}
</script>

{#if show}
	<div
		class="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-md flex items-center justify-center p-4 z-50"
		transition:fade={{ duration: 200 }}
		on:click={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<div
			class="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-700"
			transition:scale={{ duration: 200, start: 0.9, easing: quintOut }}
			on:click={handleContentClick}
		>
			<div class="flex justify-between items-center mb-6">
				<h3 id="modal-title" class="text-xl font-semibold text-gray-100">{title}</h3>
				<button
					on:click={onClose}
					class="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
					aria-label="Close modal"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				</button>
			</div>

			<slot />
		</div>
	</div>
{/if}