<script lang="ts">
	export let onClick: () => void;
	export let title: string = 'Add new project';
	export let ariaLabel: string = 'Add new project';
</script>

<button
	on:click={onClick}
	class="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 flex items-center justify-center group"
	{title}
	aria-label={ariaLabel}
>
	<svg class="w-6 h-6 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
	</svg>
</button>