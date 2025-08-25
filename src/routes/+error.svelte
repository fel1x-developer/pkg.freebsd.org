<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { CircleAlert, House } from '@lucide/svelte';

	const errorMessages: Record<number, { title: string; description: string }> = {
		404: {
			title: 'Page not found',
			description: "Sorry, we couldn't find the page you're looking for."
		},
		500: {
			title: 'Internal server error',
			description: 'Something went wrong on our end. Please try again later.'
		},
		403: {
			title: 'Access denied',
			description: "You don't have permission to view this page."
		}
	};

	let status = $derived(page.status);
	let message = $derived(page.error?.message || 'An unexpected error occurred');
	let errorInfo = $derived(
		errorMessages[status] || {
			title: `Error ${status}`,
			description: message
		}
	);
</script>

<div class="flex min-h-screen items-center justify-center p-4">
	<Card class="w-full max-w-md">
		<CardHeader class="text-center">
			<div
				class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10"
			>
				<CircleAlert class="h-6 w-6 text-destructive" />
			</div>
			<CardTitle class="text-2xl font-bold">{errorInfo.title}</CardTitle>
			<CardDescription>{errorInfo.description}</CardDescription>
		</CardHeader>
		<CardContent class="text-center">
			<p class="text-sm text-muted-foreground">
				Error code: <code class="rounded bg-muted px-1 py-0.5 text-xs">{status}</code>
			</p>
		</CardContent>
		<CardFooter class="flex justify-center">
			<Button href="/" variant="default">
				<House class="mr-2 h-4 w-4" />
				Back to home
			</Button>
		</CardFooter>
	</Card>
</div>
