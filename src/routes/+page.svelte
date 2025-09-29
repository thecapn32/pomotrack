<script lang="ts">
	import { onMount } from 'svelte';
	import Modal from '$lib/components/Modal.svelte';
	import ProjectForm from '$lib/components/ProjectForm.svelte';
	import TaskForm from '$lib/components/TaskForm.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import TabNavigation from '$lib/components/TabNavigation.svelte';
	import FloatingActionButton from '$lib/components/FloatingActionButton.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';

	import { projects } from '$lib/stores/projects.js';
	import { currentTab } from '$lib/stores/navigation.js';
	import type { NewProject, NewTask, TabType } from '$lib/types.js';

	// Initialize projects from database when component mounts
	onMount(async () => {
		console.log('Component mounted, initializing projects...');
		try {
			await projects.init();
			console.log('Projects initialized successfully');
		} catch (error) {
			console.error('Failed to initialize projects:', error);
		}
	});

	let showModal = false;
	let showTaskModal = false;
	let modalType: 'project' | 'task' = 'project';
	let selectedProjectId = '';

	let newProject: NewProject = {
		name: '',
		description: '',
		color: '#3B82F6'
	};

	let newTask: NewTask = {
		name: '',
		description: '',
		projectId: ''
	};

	function handleAddProject(project: NewProject) {
		projects.add(project);
		closeModal();
	}

	function handleDeleteProject(id: string) {
		projects.remove(id);
	}

	function handleAddTask(task: NewTask) {
		projects.addTask(task);
		closeTaskModal();
	}

	function handleAddTaskToProject(projectId: string) {
		selectedProjectId = projectId;
		newTask.projectId = projectId;
		showTaskModal = true;
	}

	function handleToggleTask(projectId: string, taskId: string) {
		projects.toggleTask(projectId, taskId);
	}

	function handleDeleteTask(projectId: string, taskId: string) {
		projects.removeTask(projectId, taskId);
	}

	function handleTabChange(tab: TabType) {
		currentTab.setTab(tab);
	}

	function openModal() {
		modalType = 'project';
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		resetProjectForm();
	}

	function closeTaskModal() {
		showTaskModal = false;
		resetTaskForm();
	}

	function resetProjectForm() {
		newProject = {
			name: '',
			description: '',
			color: '#3B82F6'
		};
	}

	function resetTaskForm() {
		newTask = {
			name: '',
			description: '',
			projectId: ''
		};
		selectedProjectId = '';
	}

	function getProjectName(projectId: string): string {
		const project = $projects.find(p => p.id === projectId);
		return project?.name || '';
	}
</script>

<div class="min-h-screen bg-gray-900">
	<div class="max-w-6xl mx-auto p-8">
		<h1 class="text-4xl font-bold text-white mb-8">PomoTrack</h1>

		<TabNavigation activeTab={$currentTab} onTabChange={handleTabChange} />

		<!-- Tab Content -->
		<div class="bg-gray-800 rounded-b-lg shadow-md p-6 border border-gray-700 border-t-0">
			{#if $currentTab === 'overview'}
				<div class="space-y-6">
					<div>
						<h2 class="text-2xl font-semibold text-gray-100 mb-4">Project Overview</h2>
						<p class="text-gray-300 mb-6">Manage your projects and track your progress with the Pomodoro Technique.</p>
					</div>

					<!-- Projects List -->
					<div>
						<h3 class="text-lg font-medium text-gray-100 mb-4">Your Projects</h3>
						{#each $projects as project (project.id)}
							<ProjectCard {project} onDelete={handleDeleteProject} onAddTask={handleAddTaskToProject} onToggleTask={handleToggleTask} onDeleteTask={handleDeleteTask} />
						{:else}
							<EmptyState />
						{/each}
					</div>
				</div>

			{:else if $currentTab === 'timer'}
				<div class="text-center py-12">
					<h2 class="text-2xl font-semibold text-gray-100 mb-4">Pomodoro Timer</h2>
					<p class="text-gray-300">Timer functionality coming soon...</p>
				</div>

			{:else if $currentTab === 'stats'}
				<div class="text-center py-12">
					<h2 class="text-2xl font-semibold text-gray-100 mb-4">Statistics</h2>
					<p class="text-gray-300">Statistics and analytics coming soon...</p>
				</div>
			{/if}
		</div>
	</div>

	<FloatingActionButton onClick={openModal} />

	<Modal show={showModal} title="Add New Project" onClose={closeModal}>
		<ProjectForm project={newProject} onSubmit={handleAddProject} onCancel={closeModal} />
	</Modal>

	<Modal show={showTaskModal} title="Add New Task" onClose={closeTaskModal}>
		<TaskForm task={newTask} onSubmit={handleAddTask} onCancel={closeTaskModal} projectName={getProjectName(selectedProjectId)} />
	</Modal>
</div>
