<script lang="ts">
	import type { TabType } from '../types.js';

	export let activeTab: TabType;
	export let onTabChange: (tab: TabType) => void;

	const tabs: { id: TabType; label: string }[] = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'timer', label: 'Timer' },
		{ id: 'stats', label: 'Statistics' }
	];

	function handleTabClick(tab: TabType) {
		onTabChange(tab);
	}

	$: getTabClasses = (tab: TabType) => {
		const baseClasses = 'pb-4 px-1 border-b-2 font-medium text-sm transition-colors';
		const activeClasses = 'border-blue-400 text-blue-400';
		const inactiveClasses = 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500';

		const isActive = activeTab === tab;
		return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
	};
</script>

<div class="bg-gray-800 rounded-t-lg shadow-sm border border-gray-700">
	<nav class="flex space-x-8 px-6 pt-6">
		{#each tabs as tab (tab.id)}
			<button
				class={getTabClasses(tab.id)}
				on:click={() => handleTabClick(tab.id)}
			>
				{tab.label}
			</button>
		{/each}
	</nav>
</div>