<script lang="ts">
	import { page } from '$app/state';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import {
		ArrowLeft,
		ExternalLink,
		Package as PackageIcon,
		Copy,
		Check,
		Mail
	} from '@lucide/svelte';
	import { getPackage } from './package.remote';

	const { abiVersion, abiArch, repository, period, name } = page.params;
	const packageQuery = $derived(
		getPackage({
			abiVersion: abiVersion || '',
			abiArch: abiArch || '',
			repository: repository || '',
			period: period || '',
			name: name || ''
		})
	);

	let copiedSha = $state(false);
	let copiedGitHash = $state(false);

	async function copySha(sum: string) {
		await navigator.clipboard.writeText(sum);
		copiedSha = true;
		setTimeout(() => {
			copiedSha = false;
		}, 2000);
	}

	async function copyGitHash(hash: string) {
		await navigator.clipboard.writeText(hash);
		copiedGitHash = true;
		setTimeout(() => {
			copiedGitHash = false;
		}, 2000);
	}

	function formatBytes(bytes: number): string {
		if (!bytes) return 'N/A';
		const units = ['B', 'KB', 'MB', 'GB'];
		let size = bytes;
		let unitIndex = 0;
		while (size >= 1024 && unitIndex < units.length - 1) {
			size /= 1024;
			unitIndex++;
		}
		return `${size.toFixed(2)} ${units[unitIndex]}`;
	}

	function formatDate(dateString: string): string {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<div class="container mx-auto px-4 py-8">
	<!-- Back button -->
	<div class="mb-6">
		<Button variant="ghost" size="sm" onclick={() => window.history.back()}>
			<ArrowLeft class="mr-2 h-4 w-4" />
			Back to Search
		</Button>
	</div>

	{#if packageQuery.loading}
		<!-- Loading skeleton -->
		<Card class="mb-8">
			<CardHeader>
				<div class="flex items-start justify-between">
					<div class="flex items-start gap-4">
						<div class="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
							<PackageIcon class="h-8 w-8 animate-pulse text-primary" />
						</div>
						<div class="flex-1">
							<div class="flex items-center gap-3">
								<Skeleton class="h-9 w-48" />
								<Skeleton class="h-6 w-16" />
							</div>
							<Skeleton class="mt-2 h-4 w-96" />
							<div class="mt-2 flex flex-wrap gap-2">
								<Skeleton class="h-6 w-20" />
								<Skeleton class="h-6 w-16" />
								<Skeleton class="h-6 w-24" />
								<Skeleton class="h-6 w-20" />
							</div>
						</div>
					</div>
				</div>
			</CardHeader>
		</Card>

		<div class="grid gap-6 md:grid-cols-2">
			{#each Array(4), i (i)}
				<Card>
					<CardHeader>
						<Skeleton class="h-6 w-40" />
					</CardHeader>
					<CardContent class="space-y-4">
						{#each Array(5), j (j)}
							<div>
								<Skeleton class="mb-2 h-4 w-24" />
								<Skeleton class="h-4 w-full" />
							</div>
						{/each}
					</CardContent>
				</Card>
			{/each}
		</div>
	{:else if packageQuery.error}
		<!-- Error state -->
		<Card>
			<CardContent class="p-6">
				<p class="text-red-500">Error loading package: {packageQuery.error.message}</p>
			</CardContent>
		</Card>
	{:else if packageQuery.current}
		{@const pkg = packageQuery.current}

		<!-- Package header -->
		<Card class="mb-8">
			<CardHeader>
				<div class="flex items-start justify-between">
					<div class="flex items-start gap-4">
						<div class="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
							<PackageIcon class="h-8 w-8 text-primary" />
						</div>
						<div>
							<div class="flex items-center gap-3">
								<CardTitle class="text-3xl">{pkg.name}</CardTitle>
								<Badge variant="secondary">{pkg.version}</Badge>
							</div>
							<p class="mt-2 text-muted-foreground">{pkg.comment}</p>
							<div class="mt-2 flex flex-wrap gap-2">
								<Badge variant="outline">FreeBSD {pkg.abiVersion}</Badge>
								<Badge variant="outline">{pkg.abiArch}</Badge>
								<Badge variant="outline">{pkg.repository}</Badge>
								<Badge variant="outline">{pkg.period}</Badge>
							</div>
						</div>
					</div>
				</div>
			</CardHeader>
		</Card>

		<!-- Package information grid -->
		<div class="grid gap-6 md:grid-cols-2">
			<!-- Basic Information -->
			<Card>
				<CardHeader>
					<CardTitle>Package Information</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div>
						<p class="text-sm font-medium text-muted-foreground">Origin</p>
						<a
							href={`https://github.com/freebsd/freebsd-ports/tree/main/${pkg.origin}`}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center text-primary hover:underline"
						>
							{pkg.origin}
							<ExternalLink class="ml-1 h-3 w-3" />
						</a>
					</div>

					<div>
						<p class="text-sm font-medium text-muted-foreground">Maintainer</p>
						<a
							href={`mailto:${pkg.maintainer}`}
							rel="noopener noreferrer"
							class="inline-flex items-center text-primary hover:underline"
						>
							{pkg.maintainer}
							<Mail class="ml-1 h-3 w-3" />
						</a>
					</div>

					{#if pkg.www}
						<div>
							<p class="text-sm font-medium text-muted-foreground">Homepage</p>
							<a
								href={pkg.www}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center text-primary hover:underline"
							>
								{pkg.www}
								<ExternalLink class="ml-1 h-3 w-3" />
							</a>
						</div>
					{/if}

					{#if pkg.licenses && pkg.licenses.length > 0}
						<div>
							<p class="text-sm font-medium text-muted-foreground">Licenses</p>
							<div class="mt-1 flex flex-wrap gap-2">
								{#each pkg.licenses as license (license)}
									<Badge variant="secondary">{license}</Badge>
								{/each}
							</div>
						</div>
					{/if}

					{#if pkg.categories && pkg.categories.length > 0}
						<div>
							<p class="text-sm font-medium text-muted-foreground">Categories</p>
							<div class="mt-1 flex flex-wrap gap-2">
								{#each pkg.categories as category (category)}
									<Badge variant="outline">{category}</Badge>
								{/each}
							</div>
						</div>
					{/if}
				</CardContent>
			</Card>

			<!-- Technical Details -->
			<Card>
				<CardHeader>
					<CardTitle>Technical Details</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div>
						<p class="text-sm font-medium text-muted-foreground">ABI</p>
						<p class="font-mono">{pkg.abi}</p>
					</div>

					<div>
						<p class="text-sm font-medium text-muted-foreground">Architecture</p>
						<p class="font-mono">{pkg.arch}</p>
					</div>

					<div>
						<p class="text-sm font-medium text-muted-foreground">Prefix</p>
						<p class="font-mono">{pkg.prefix}</p>
					</div>

					<div>
						<p class="text-sm font-medium text-muted-foreground">Package Size</p>
						<p>{formatBytes(pkg.pkgSize ?? 0)}</p>
					</div>

					<div>
						<p class="text-sm font-medium text-muted-foreground">Installed Size</p>
						<p>{formatBytes(pkg.flatSize ?? 0)}</p>
					</div>

					<div>
						<p class="text-sm font-medium text-muted-foreground">SHA256 Sum</p>
						<div class="flex items-center gap-1">
							<p class="font-mono text-xs break-all">{pkg.sum}</p>
							<Button
								variant="ghost"
								size="icon"
								class="h-6 w-6 shrink-0"
								onclick={() => copySha(pkg.sum)}
							>
								{#if copiedSha}
									<Check class="h-3 w-3" />
								{:else}
									<Copy class="h-3 w-3" />
								{/if}
								<span class="sr-only">Copy SHA256</span>
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			<!-- Build Information -->
			{#if pkg.annotations}
				<Card>
					<CardHeader>
						<CardTitle>Build Information</CardTitle>
					</CardHeader>
					<CardContent class="space-y-4">
						<div>
							<p class="text-sm font-medium text-muted-foreground">Build Date</p>
							<p>{formatDate(pkg.annotations.build_timestamp)}</p>
						</div>

						<div>
							<p class="text-sm font-medium text-muted-foreground">Built By</p>
							<p>{pkg.annotations.built_by || 'N/A'}</p>
						</div>

						<div>
							<p class="text-sm font-medium text-muted-foreground">FreeBSD Version</p>
							<p>{pkg.annotations.FreeBSD_version || 'N/A'}</p>
						</div>

						{#if pkg.annotations.port_git_hash}
							<div>
								<p class="text-sm font-medium text-muted-foreground">Port Git Hash</p>
								<div class="flex items-center gap-1">
									<p class="font-mono text-xs break-all">{pkg.annotations.port_git_hash}</p>
									<Button
										variant="ghost"
										size="icon"
										class="h-6 w-6 shrink-0"
										onclick={() => copyGitHash(pkg.annotations.port_git_hash)}
									>
										{#if copiedGitHash}
											<Check class="h-3 w-3" />
										{:else}
											<Copy class="h-3 w-3" />
										{/if}
										<span class="sr-only">Copy Git Hash</span>
									</Button>
								</div>
							</div>
						{/if}

						{#if pkg.annotations.flavor}
							<div>
								<p class="text-sm font-medium text-muted-foreground">Flavor</p>
								<p>{pkg.annotations.flavor}</p>
							</div>
						{/if}
					</CardContent>
				</Card>
			{/if}

			<!-- Description -->
			<Card class="md:col-span-2">
				<CardHeader>
					<CardTitle>Description</CardTitle>
				</CardHeader>
				<CardContent>
					<p class="whitespace-pre-wrap">{pkg.description}</p>
				</CardContent>
			</Card>

			<!-- Dependencies -->
			{#if pkg.dependencies && Object.keys(pkg.dependencies).length > 0}
				<Card class="md:col-span-2">
					<CardHeader>
						<CardTitle>Dependencies</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="space-y-2">
							{#each Object.entries(pkg.dependencies) as [name, dep] (name)}
								<div class="flex items-center justify-between rounded-lg border p-3">
									<div>
										<p class="font-medium">{name}</p>
										<p class="text-sm text-muted-foreground">{dep.origin}</p>
									</div>
									<Badge variant="outline">{dep.version}</Badge>
								</div>
							{/each}
						</div>
					</CardContent>
				</Card>
			{/if}

			<!-- Shared Libraries -->
			{#if pkg.shlibsRequired && pkg.shlibsRequired.length > 0}
				<Card>
					<CardHeader>
						<CardTitle>Required Shared Libraries</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="space-y-1">
							{#each pkg.shlibsRequired as lib (lib)}
								<p class="font-mono text-sm">{lib}</p>
							{/each}
						</div>
					</CardContent>
				</Card>
			{/if}

			{#if pkg.shlibsProvided && pkg.shlibsProvided.length > 0}
				<Card>
					<CardHeader>
						<CardTitle>Provided Shared Libraries</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="space-y-1">
							{#each pkg.shlibsProvided as lib (lib)}
								<p class="font-mono text-sm">{lib}</p>
							{/each}
						</div>
					</CardContent>
				</Card>
			{/if}

			<!-- Options -->
			{#if pkg.options && Object.keys(pkg.options).length > 0}
				<Card class="md:col-span-2">
					<CardHeader>
						<CardTitle>Build Options</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="grid gap-2 sm:grid-cols-2">
							{#each Object.entries(pkg.options) as [option, value] (option)}
								<div class="flex items-center justify-between rounded-lg border p-2">
									<span class="font-mono text-sm">{option}</span>
									<Badge variant={value === 'on' ? 'default' : 'secondary'}>
										{value}
									</Badge>
								</div>
							{/each}
						</div>
					</CardContent>
				</Card>
			{/if}

			<!-- Messages -->
			{#if pkg.messages && pkg.messages.length > 0}
				<Card class="md:col-span-2">
					<CardHeader>
						<CardTitle>Messages</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="space-y-4">
							{#each pkg.messages as message (message.type)}
								<div class="rounded-lg border p-4">
									<div class="mb-2 flex items-center gap-2">
										<Badge>{message.type}</Badge>
										{#if message.minimum_version || message.maximum_version}
											<span class="text-sm text-muted-foreground">
												{#if message.minimum_version}≥ {message.minimum_version}{/if}
												{#if message.minimum_version && message.maximum_version}
													-
												{/if}
												{#if message.maximum_version}≤ {message.maximum_version}{/if}
											</span>
										{/if}
									</div>
									<p class="whitespace-pre-wrap">{message.message}</p>
								</div>
							{/each}
						</div>
					</CardContent>
				</Card>
			{/if}
		</div>
	{/if}
</div>
