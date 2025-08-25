<script lang="ts">
	import { getPackages, getFilterOptions } from './packages.remote';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { SunIcon, MoonIcon } from '@lucide/svelte';
	import { toggleMode } from 'mode-watcher';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	// Form inputs (reactive to URL changes)
	let searchQuery = $state($page.url.searchParams.get('q') || '');
	let selectedRepo = $state($page.url.searchParams.get('repository') || '');
	let selectedAbiVersion = $state($page.url.searchParams.get('abi') || '');
	let selectedAbiArch = $state($page.url.searchParams.get('arch') || '');
	let selectedPeriod = $state($page.url.searchParams.get('period') || '');

	// Search parameters (reactive to URL changes)
	let searchParams = $state({
		query: $page.url.searchParams.get('q') || '',
		repository: $page.url.searchParams.get('repository') || '',
		abiVersion: $page.url.searchParams.get('abi') || '',
		abiArch: $page.url.searchParams.get('arch') || '',
		period: $page.url.searchParams.get('period') || '',
		page: Number($page.url.searchParams.get('page')) || 1
	});

	// Sync state with URL parameters on navigation
	$effect(() => {
		const urlParams = $page.url.searchParams;
		searchQuery = urlParams.get('q') || '';
		selectedRepo = urlParams.get('repository') || '';
		selectedAbiVersion = urlParams.get('abi') || '';
		selectedAbiArch = urlParams.get('arch') || '';
		selectedPeriod = urlParams.get('period') || '';

		searchParams = {
			query: urlParams.get('q') || '',
			repository: urlParams.get('repository') || '',
			abiVersion: urlParams.get('abi') || '',
			abiArch: urlParams.get('arch') || '',
			period: urlParams.get('period') || '',
			page: Number(urlParams.get('page')) || 1
		};
	});

	const filterOptions = getFilterOptions();

	const packagesQuery = $derived(getPackages(searchParams));

	function handleSearch(e: Event) {
		e.preventDefault();
		searchParams = {
			query: searchQuery,
			repository: selectedRepo,
			abiVersion: selectedAbiVersion,
			abiArch: selectedAbiArch,
			period: selectedPeriod,
			page: 1
		};
		updateUrl();
	}

	function handleReset() {
		searchQuery = '';
		selectedRepo = '';
		selectedAbiVersion = '';
		selectedAbiArch = '';
		searchParams = {
			query: '',
			repository: '',
			abiVersion: '',
			abiArch: '',
			period: '',
			page: 1
		};
		updateUrl();
	}

	function handlePageChange(newPage: number) {
		searchParams = { ...searchParams, page: newPage };
		updateUrl();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function updateUrl() {
		const params = new SvelteURLSearchParams();
		if (searchParams.query) params.set('q', searchParams.query);
		if (searchParams.repository) params.set('repository', searchParams.repository);
		if (searchParams.abiVersion) params.set('abi', searchParams.abiVersion);
		if (searchParams.abiArch) params.set('arch', searchParams.abiArch);
		if (searchParams.period) params.set('period', searchParams.period);
		if (searchParams.page > 1) params.set('page', searchParams.page.toString());

		const newUrl = params.toString() ? `?${params}` : '/';
		goto(newUrl, { replaceState: true, keepFocus: true });
	}

	function handleFilterClick(filterType: string, value: string) {
		switch (filterType) {
			case 'abiVersion':
				selectedAbiVersion = value;
				break;
			case 'abiArch':
				selectedAbiArch = value;
				break;
			case 'repository':
				selectedRepo = value;
				break;
			case 'period':
				selectedPeriod = value;
				break;
		}
		searchParams = {
			query: searchQuery,
			repository: filterType === 'repository' ? value : selectedRepo,
			abiVersion: filterType === 'abiVersion' ? value : selectedAbiVersion,
			abiArch: filterType === 'abiArch' ? value : selectedAbiArch,
			period: filterType === 'period' ? value : selectedPeriod,
			page: 1
		};
		updateUrl();
	}
</script>

<svelte:head>
	<title>FreeBSD | Package Search</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<Card class="mb-8">
		<CardHeader>
			<div class="flex items-start justify-between">
				<div>
					<CardTitle class="text-3xl font-bold">FreeBSD Package Search</CardTitle>
					<p class="mt-1 text-muted-foreground">
						Search and explore FreeBSD packages across different ABI versions, architectures,
						repositories, and periods. Find packages by name or comment.
					</p>
				</div>
				<Button onclick={toggleMode} variant="outline" size="icon">
					<SunIcon
						class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90"
					/>
					<MoonIcon
						class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0"
					/>
					<span class="sr-only">Toggle theme</span>
				</Button>
			</div>
		</CardHeader>
		<CardContent>
			<form onsubmit={handleSearch} class="space-y-4">
				<div class="flex gap-2">
					<Input
						type="text"
						placeholder="Search packages by name or description..."
						bind:value={searchQuery}
						class="flex-1"
					/>
					<Button type="submit">Search</Button>
					<Button type="button" variant="outline" onclick={handleReset}>Reset</Button>
				</div>

				{#await filterOptions}
					<div class="grid grid-cols-1 gap-4 md:grid-cols-4">
						<Skeleton class="h-10" />
						<Skeleton class="h-10" />
						<Skeleton class="h-10" />
						<Skeleton class="h-10" />
					</div>
				{:then filters}
					<div class="grid grid-cols-1 gap-4 md:grid-cols-4">
						<div>
							<label for="abi-select" class="mb-2 block text-sm font-medium">ABI</label>
							<Select.Root type="single" bind:value={selectedAbiVersion}>
								<Select.Trigger id="abi-select" class="w-full">
									{selectedAbiVersion || 'All ABIs'}
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="">All ABIs</Select.Item>
									{#each filters.abiVersions as abiVersion (abiVersion)}
										<Select.Item value={abiVersion}>{abiVersion}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>

						<div>
							<label for="arch-select" class="mb-2 block text-sm font-medium">Architecture</label>
							<Select.Root type="single" bind:value={selectedAbiArch}>
								<Select.Trigger id="arch-select" class="w-full">
									{selectedAbiArch || 'All Architectures'}
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="">All Architectures</Select.Item>
									{#each filters.abiArchs as abiArch (abiArch)}
										<Select.Item value={abiArch}>{abiArch}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>

						<div>
							<label for="repository-select" class="mb-2 block text-sm font-medium"
								>Repository</label
							>
							<Select.Root type="single" bind:value={selectedRepo}>
								<Select.Trigger id="repository-select" class="w-full">
									{selectedRepo || 'All Repositories'}
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="">All Repositories</Select.Item>
									{#each filters.repositories as repo (repo)}
										<Select.Item value={repo}>{repo}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>

						<div>
							<label for="period-select" class="mb-2 block text-sm font-medium">Period</label>
							<Select.Root type="single" bind:value={selectedPeriod}>
								<Select.Trigger id="period-select" class="w-full">
									{selectedPeriod || 'All Periods'}
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="">All Periods</Select.Item>
									{#each filters.periods as period (period)}
										<Select.Item value={period}>{period}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
					</div>
				{/await}
			</form>
		</CardContent>
	</Card>

	{#if packagesQuery.loading}
		<Card>
			<CardContent class="p-6">
				<div class="space-y-4">
					{#each Array(10), i (i)}
						<div class="flex items-center space-x-4">
							<Skeleton class="h-12 w-12" />
							<div class="flex-1 space-y-2">
								<Skeleton class="h-4 w-[250px]" />
								<Skeleton class="h-4 w-[200px]" />
							</div>
						</div>
					{/each}
				</div>
			</CardContent>
		</Card>
	{:else if packagesQuery.error}
		<Card>
			<CardContent class="p-6">
				<p class="text-red-500">Error loading packages: {packagesQuery.error.message}</p>
			</CardContent>
		</Card>
	{:else if packagesQuery.current}
		{@const data = packagesQuery.current}
		<Card>
			<CardHeader>
				<div class="flex items-center justify-between">
					<CardTitle>
						{data.totalCount} packages found
					</CardTitle>
					{#if data.totalPages > 1}
						<div class="text-sm text-muted-foreground">
							Page {data.currentPage} of {data.totalPages}
						</div>
					{/if}
				</div>
			</CardHeader>
			<CardContent>
				{#if data.items.length === 0}
					<p class="py-8 text-center text-muted-foreground">
						No packages found matching your criteria.
					</p>
				{:else}
					<div class="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Package</TableHead>
									<TableHead>Version</TableHead>
									<TableHead>ABI Version</TableHead>
									<TableHead>Architecture</TableHead>
									<TableHead>Repository</TableHead>
									<TableHead>Period</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{#each data.items as pkg (pkg.id)}
									<TableRow>
										<TableCell>
											<div>
												<a
													href={`/packages/${pkg.abiVersion}/${pkg.abiArch}/${pkg.repository}/${pkg.period}/${pkg.name}`}
													class="font-medium hover:underline">{pkg.name}</a
												>
												<div class="text-sm text-muted-foreground">{pkg.comment}</div>
											</div>
										</TableCell>
										<TableCell>{pkg.version}</TableCell>
										<TableCell>
											<button
												onclick={() => handleFilterClick('abiVersion', pkg.abiVersion)}
												class="cursor-pointer text-primary hover:underline"
											>
												{pkg.abiVersion}
											</button>
										</TableCell>
										<TableCell>
											<button
												onclick={() => handleFilterClick('abiArch', pkg.abiArch)}
												class="cursor-pointer text-primary hover:underline"
											>
												{pkg.abiArch}
											</button>
										</TableCell>
										<TableCell>
											<button
												onclick={() => handleFilterClick('repository', pkg.repository)}
												class="cursor-pointer"
											>
												<Badge variant="secondary" class="hover:bg-secondary/80">
													{pkg.repository}
												</Badge>
											</button>
										</TableCell>
										<TableCell>
											<button
												onclick={() => handleFilterClick('period', pkg.period)}
												class="cursor-pointer"
											>
												<Badge variant="secondary" class="hover:bg-secondary/80">
													{pkg.period}
												</Badge>
											</button>
										</TableCell>
									</TableRow>
								{/each}
							</TableBody>
						</Table>
					</div>

					{#if data.totalPages > 1}
						<div class="mt-6 flex justify-center gap-2">
							<Button
								variant="outline"
								onclick={() => handlePageChange(data.currentPage - 1)}
								disabled={data.currentPage === 1}
							>
								Previous
							</Button>

							{#each Array(Math.min(5, data.totalPages)), i (i)}
								{@const pageNum = data.currentPage <= 3 ? i + 1 : data.currentPage - 2 + i}
								{#if pageNum > 0 && pageNum <= data.totalPages}
									<Button
										variant={pageNum === data.currentPage ? 'default' : 'outline'}
										onclick={() => handlePageChange(pageNum)}
									>
										{pageNum}
									</Button>
								{/if}
							{/each}

							<Button
								variant="outline"
								onclick={() => handlePageChange(data.currentPage + 1)}
								disabled={data.currentPage === data.totalPages}
							>
								Next
							</Button>
						</div>
					{/if}
				{/if}
			</CardContent>
		</Card>
	{/if}
</div>
