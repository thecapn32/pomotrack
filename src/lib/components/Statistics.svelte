<script lang="ts">
	import { onMount } from 'svelte';
	import type { ProjectWithTasks } from '../types.js';

	export let projects: ProjectWithTasks[];

	interface DailyData {
		[date: string]: {
			[projectId: string]: {
				minutes: number;
				color: string;
				name: string;
			};
		};
	}

	interface ChartData {
		dailyData: DailyData;
		projects: { id: string; name: string; color: string }[];
		dateRange: { start: string; end: string; days: number };
	}

	let chartData: ChartData | null = null;
	let loading = true;
	let error = '';
	let days = 14;
	let useRealData = true;

	// Chart dimensions
	const chartHeight = 400;
	const paddingLeft = 60;
	const paddingRight = 60;
	const paddingTop = 20;
	const paddingBottom = 80;

	// Make chart fully responsive
	let containerWidth = 0;

	// Tooltip state
	let tooltipVisible = false;
	let tooltipX = 0;
	let tooltipY = 0;
	let tooltipContent = { hours: 0, minutes: 0, date: '', projects: [] as Array<{name: string, color: string, minutes: number}> };

	// Calculate chart width based on container, accounting for all padding
	$: chartWidth = containerWidth > 0 ? containerWidth : 800;
	$: innerWidth = chartWidth - paddingLeft - paddingRight;
	$: innerHeight = chartHeight - paddingTop - paddingBottom;

	// Calculate chart data from projects
	$: {
		if (useRealData) {
			fetchStatistics();
		} else {
			generateChartData();
		}
	}

	async function fetchStatistics() {
		loading = true;
		error = '';

		try {
			const response = await fetch(`/api/statistics?days=${days}`);
			if (!response.ok) {
				throw new Error('Failed to fetch statistics');
			}

			const data = await response.json();
			chartData = data;
			loading = false;
		} catch (err) {
			console.error('Error fetching statistics:', err);
			error = 'Failed to load statistics data';
			loading = false;
		}
	}

	function generateChartData() {
		// Create daily data structure
		const dailyData: DailyData = {};
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);
		startDate.setHours(0, 0, 0, 0);

		// Initialize all dates
		for (let i = 0; i < days; i++) {
			const date = new Date(startDate);
			date.setDate(date.getDate() + i);
			const dateKey = date.toISOString().split('T')[0];
			dailyData[dateKey] = {};
		}

		// Aggregate project time data
		// Note: This is a simplified version that shows total time per project
		// In a real scenario, you would fetch actual time session data from the API
		projects.forEach((project) => {
			const totalMinutes = project.totalMinutes || 0;

			// For demo purposes, distribute the time across the days
			// In production, this would come from actual time_sessions data
			if (totalMinutes > 0) {
				// Distribute time across recent days (simple demo logic)
				const avgPerDay = totalMinutes / days;
				Object.keys(dailyData).forEach((dateKey, index) => {
					// Add some variance for demo
					const variance = Math.random() * 0.5 + 0.75; // 0.75 to 1.25
					const minutes = Math.floor(avgPerDay * variance);

					if (minutes > 0) {
						dailyData[dateKey][project.id] = {
							minutes,
							color: project.color,
							name: project.name
						};
					}
				});
			}
		});

		chartData = {
			dailyData,
			projects: projects.map((p) => ({
				id: p.id,
				name: p.name,
				color: p.color
			})),
			dateRange: {
				start: startDate.toISOString(),
				end: new Date().toISOString(),
				days
			}
		};

		loading = false;
	}

	// Calculate max value for Y-axis scaling
	$: maxValue = chartData
		? Math.max(
				...Object.values(chartData.dailyData).map((day) =>
					Object.values(day).reduce((sum, p) => sum + p.minutes, 0)
				),
				1
		  )
		: 1;

	// Calculate bar positions
	$: bars = chartData
		? Object.entries(chartData.dailyData).map(([date, projectsData], index) => {
				const barSpacing = 2;
				const barWidth = Math.max((innerWidth / days) - barSpacing, 8); // Min 8px width
				const x = (index * (innerWidth / days)) + paddingLeft + (barSpacing / 2);

				// Stack bars for each project
				let currentY = chartHeight - paddingBottom;
				const projectBars = Object.entries(projectsData).map(([projectId, data]) => {
					const barHeight = (data.minutes / maxValue) * innerHeight;
					const y = currentY - barHeight;
					currentY = y;

					return {
						x,
						y,
						width: barWidth,
						height: barHeight,
						color: data.color,
						projectName: data.name,
						minutes: data.minutes,
						date
					};
				});

				return {
					date,
					x,
					barWidth,
					bars: projectBars
				};
		  })
		: [];

	// Format date for display
	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		return `${date.getMonth() + 1}/${date.getDate()}`;
	}

	// Format date for tooltip (more detailed)
	function formatDateLong(dateStr: string): string {
		const date = new Date(dateStr);
		const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
		return date.toLocaleDateString('en-US', options);
	}

	// Show tooltip on hover
	function handleBarHover(event: MouseEvent, date: string, projectsData: any) {
		const totalMinutes = Object.values(projectsData).reduce((sum: number, p: any) => sum + p.minutes, 0);

		// Don't show tooltip if no time tracked
		if (totalMinutes === 0) {
			tooltipVisible = false;
			return;
		}

		const hours = Math.floor(totalMinutes / 60);
		const minutes = totalMinutes % 60;

		const projects = Object.entries(projectsData).map(([id, data]: [string, any]) => ({
			name: data.name,
			color: data.color,
			minutes: data.minutes
		}));

		tooltipContent = {
			hours,
			minutes,
			date: formatDateLong(date),
			projects
		};

		tooltipX = event.clientX;
		tooltipY = event.clientY;
		tooltipVisible = true;
	}

	function hideTooltip() {
		tooltipVisible = false;
	}

	// Calculate Y-axis labels
	$: yAxisLabels = (() => {
		const labels = [];
		const step = Math.ceil(maxValue / 5);
		for (let i = 0; i <= 5; i++) {
			labels.push({
				value: i * step,
				y: chartHeight - paddingBottom - (i * step * innerHeight) / maxValue
			});
		}
		return labels;
	})();

	// Calculate total time per project
	$: projectTotals = chartData
		? chartData.projects.map((project) => {
				const total = Object.values(chartData.dailyData).reduce((sum, day) => {
					return sum + (day[project.id]?.minutes || 0);
				}, 0);
				return {
					...project,
					total
				};
		  }).filter(p => p.total > 0).sort((a, b) => b.total - a.total)
		: [];
</script>

<div class="max-w-6xl mx-auto p-6">
	<div class="mb-8">
		<h2 class="text-3xl font-bold text-gray-100 mb-2">📊 Statistics</h2>
		<p class="text-gray-400">Time spent on projects over the last {days} days</p>
	</div>

	{#if loading}
		<div class="text-center py-12">
			<div class="text-gray-400">Loading statistics...</div>
		</div>
	{:else if error}
		<div class="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-300">
			{error}
		</div>
	{:else if !chartData || projectTotals.length === 0}
		<div class="text-center py-12">
			<div class="text-gray-400 mb-4">No time tracking data available yet.</div>
			<p class="text-sm text-gray-500">Complete some Pomodoro sessions to see statistics here!</p>
		</div>
	{:else}
		<!-- Summary Cards -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
			<div class="bg-gray-700 rounded-lg p-6">
				<div class="text-gray-400 text-sm mb-1">Total Time (14 days)</div>
				<div class="text-3xl font-bold text-blue-400">
					{Math.floor(projectTotals.reduce((sum, p) => sum + p.total, 0))} min
				</div>
			</div>
			<div class="bg-gray-700 rounded-lg p-6">
				<div class="text-gray-400 text-sm mb-1">Active Projects</div>
				<div class="text-3xl font-bold text-green-400">
					{projectTotals.length}
				</div>
			</div>
			<div class="bg-gray-700 rounded-lg p-6">
				<div class="text-gray-400 text-sm mb-1">Avg per Day</div>
				<div class="text-3xl font-bold text-yellow-400">
					{Math.floor(projectTotals.reduce((sum, p) => sum + p.total, 0) / days)} min
				</div>
			</div>
		</div>

		<!-- Chart -->
		<div class="bg-gray-700 rounded-lg p-6 mb-8" bind:clientWidth={containerWidth}>
			<h3 class="text-lg font-medium text-gray-100 mb-4">Daily Time Tracking</h3>
			<div class="w-full">
				<svg viewBox="0 0 {chartWidth} {chartHeight}" class="w-full h-auto" preserveAspectRatio="xMidYMid meet">
				<!-- Y-axis -->
				<line
					x1={paddingLeft}
					y1={paddingTop}
					x2={paddingLeft}
					y2={chartHeight - paddingBottom}
					stroke="currentColor"
					class="text-gray-500"
					stroke-width="2"
				/>

				<!-- Y-axis labels -->
				{#each yAxisLabels as label}
					<g>
						<line
							x1={paddingLeft - 5}
							y1={label.y}
							x2={paddingLeft}
							y2={label.y}
							stroke="currentColor"
							class="text-gray-500"
							stroke-width="2"
						/>
						<text
							x={paddingLeft - 10}
							y={label.y + 5}
							text-anchor="end"
							class="text-xs fill-gray-400"
						>
							{label.value}m
						</text>
						<!-- Grid line -->
						<line
							x1={paddingLeft}
							y1={label.y}
							x2={chartWidth - paddingRight}
							y2={label.y}
							stroke="currentColor"
							class="text-gray-600 opacity-20"
							stroke-width="1"
							stroke-dasharray="4"
						/>
					</g>
				{/each}

				<!-- X-axis -->
				<line
					x1={paddingLeft}
					y1={chartHeight - paddingBottom}
					x2={chartWidth - paddingRight}
					y2={chartHeight - paddingBottom}
					stroke="currentColor"
					class="text-gray-500"
					stroke-width="2"
				/>

				<!-- Bars -->
				{#each bars as dayData, index}
					<g>
						{#each dayData.bars as bar}
							<rect
								x={bar.x}
								y={bar.y}
								width={bar.width}
								height={bar.height}
								fill={bar.color}
								opacity="0.8"
								class="transition-opacity pointer-events-none"
							/>
						{/each}

						<!-- Invisible overlay for hover detection -->
						<rect
							x={dayData.x}
							y={paddingTop}
							width={dayData.barWidth}
							height={innerHeight}
							fill="transparent"
							class="cursor-pointer"
							role="button"
							tabindex="0"
							aria-label="View time for {formatDate(dayData.date)}"
							on:mouseenter={(e) => handleBarHover(e, dayData.date, chartData?.dailyData[dayData.date] || {})}
							on:mouseleave={hideTooltip}
						/>

						<!-- X-axis label -->
						{#if index % Math.ceil(days / 10) === 0}
							<text
								x={dayData.x + dayData.barWidth / 2}
								y={chartHeight - paddingBottom + 20}
								text-anchor="middle"
								class="text-xs fill-gray-400"
							>
								{formatDate(dayData.date)}
							</text>
						{/if}
					</g>
				{/each}

				<!-- Y-axis label -->
				<text
					x={15}
					y={chartHeight / 2}
					text-anchor="middle"
					transform="rotate(-90 15 {chartHeight / 2})"
					class="text-sm fill-gray-400 font-medium"
				>
					Minutes
				</text>
			</svg>
			</div>
		</div>

		<!-- Project Breakdown -->
		<div class="bg-gray-700 rounded-lg p-6">
			<h3 class="text-lg font-medium text-gray-100 mb-4">Project Breakdown</h3>
			<div class="space-y-3">
				{#each projectTotals as project}
					<div class="flex items-center justify-between">
						<div class="flex items-center space-x-3">
							<div
								class="w-4 h-4 rounded"
								style="background-color: {project.color}"
							></div>
							<span class="text-gray-200">{project.name}</span>
						</div>
						<div class="flex items-center space-x-4">
							<span class="text-gray-400">{project.total} min</span>
							<div class="w-48 bg-gray-600 rounded-full h-2">
								<div
									class="h-2 rounded-full transition-all"
									style="width: {(project.total / projectTotals[0].total) * 100}%; background-color: {project.color}"
								></div>
							</div>
							<span class="text-gray-500 text-sm w-12 text-right">
								{Math.round((project.total / projectTotals.reduce((s, p) => s + p.total, 0)) * 100)}%
							</span>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<!-- Tooltip -->
{#if tooltipVisible}
	<div
		class="fixed z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-4 pointer-events-none"
		style="left: {tooltipX + 10}px; top: {tooltipY + 10}px;"
	>
		<div class="text-sm font-medium text-gray-100 mb-2">{tooltipContent.date}</div>
		<div class="text-2xl font-bold text-blue-400 mb-3">
			{#if tooltipContent.hours > 0}
				{tooltipContent.hours}h {tooltipContent.minutes}m
			{:else}
				{tooltipContent.minutes}m
			{/if}
		</div>
		{#if tooltipContent.projects.length > 0}
			<div class="space-y-1 border-t border-gray-600 pt-2">
				{#each tooltipContent.projects as project}
					<div class="flex items-center justify-between space-x-4">
						<div class="flex items-center space-x-2">
							<div class="w-3 h-3 rounded" style="background-color: {project.color}"></div>
							<span class="text-xs text-gray-300">{project.name}</span>
						</div>
						<span class="text-xs text-gray-400">
							{Math.floor(project.minutes / 60) > 0 ? `${Math.floor(project.minutes / 60)}h ` : ''}{project.minutes % 60}m
						</span>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/if}
