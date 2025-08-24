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

	// Form inputs
	let searchQuery = $state($page.url.searchParams.get('q') || '');
	let selectedRepo = $state($page.url.searchParams.get('repository') || '');
	let selectedAbi = $state($page.url.searchParams.get('abi') || '');
	let selectedArch = $state($page.url.searchParams.get('arch') || '');

	// Search parameters (only updated when search is performed)
	let searchParams = $state({
		query: $page.url.searchParams.get('q') || '',
		repository: $page.url.searchParams.get('repository') || '',
		abi: $page.url.searchParams.get('abi') || '',
		architecture: $page.url.searchParams.get('arch') || '',
		page: Number($page.url.searchParams.get('page')) || 1
	});

	const filterOptions = getFilterOptions();

	const packagesQuery = $derived(getPackages(searchParams));

	function formatSize(bytes: number) {
		const units = ['B', 'KB', 'MB', 'GB'];
		let size = bytes;
		let unitIndex = 0;

		while (size >= 1024 && unitIndex < units.length - 1) {
			size /= 1024;
			unitIndex++;
		}

		return `${size.toFixed(1)} ${units[unitIndex]}`;
	}

	function handleSearch(e: Event) {
		e.preventDefault();
		searchParams = {
			query: searchQuery,
			repository: selectedRepo,
			abi: selectedAbi,
			architecture: selectedArch,
			page: 1
		};
		updateUrl();
	}

	function handleReset() {
		searchQuery = '';
		selectedRepo = '';
		selectedAbi = '';
		selectedArch = '';
		searchParams = {
			query: '',
			repository: '',
			abi: '',
			architecture: '',
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
		if (searchParams.abi) params.set('abi', searchParams.abi);
		if (searchParams.architecture) params.set('arch', searchParams.architecture);
		if (searchParams.page > 1) params.set('page', searchParams.page.toString());

		const newUrl = params.toString() ? `?${params}` : '/';
		goto(newUrl, { replaceState: true, keepFocus: true });
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
						Search and explore FreeBSD packages across different repositories, architectures, and
						ABIs. Find packages by name or description.
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
					<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
						<Skeleton class="h-10" />
						<Skeleton class="h-10" />
						<Skeleton class="h-10" />
					</div>
				{:then filters}
					<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
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
							<label for="abi-select" class="mb-2 block text-sm font-medium">ABI</label>
							<Select.Root type="single" bind:value={selectedAbi}>
								<Select.Trigger id="abi-select" class="w-full">
									{selectedAbi || 'All ABIs'}
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="">All ABIs</Select.Item>
									{#each filters.abis as abi (abi)}
										<Select.Item value={abi}>{abi}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>

						<div>
							<label for="arch-select" class="mb-2 block text-sm font-medium">Architecture</label>
							<Select.Root type="single" bind:value={selectedArch}>
								<Select.Trigger id="arch-select" class="w-full">
									{selectedArch || 'All Architectures'}
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="">All Architectures</Select.Item>
									{#each filters.architectures as arch (arch)}
										<Select.Item value={arch}>{arch}</Select.Item>
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
									<TableHead>Repository</TableHead>
									<TableHead>ABI</TableHead>
									<TableHead>Architecture</TableHead>
									<TableHead>Size</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{#each data.items as pkg (pkg.id)}
									<TableRow>
										<TableCell>
											<div>
												<div class="font-medium">{pkg.name}</div>
												<div class="text-sm text-muted-foreground">{pkg.comment}</div>
											</div>
										</TableCell>
										<TableCell>{pkg.version}</TableCell>
										<TableCell>
											<Badge variant="secondary">{pkg.repository}</Badge>
										</TableCell>
										<TableCell>{pkg.abi}</TableCell>
										<TableCell>{pkg.arch}</TableCell>
										<TableCell>{formatSize(pkg.flatsize)}</TableCell>
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
