import { writable } from 'svelte/store';
import type { TabType } from '../types.js';

function createNavigationStore() {
	const { subscribe, set } = writable<TabType>('overview');

	return {
		subscribe,
		setTab: (tab: TabType) => set(tab)
	};
}

export const currentTab = createNavigationStore();