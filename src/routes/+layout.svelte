<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import faviconPng from '$lib/assets/favicon-96x96.png';
	import faviconSvg from '$lib/assets/favicon.svg';
	import faviconIco from '$lib/assets/favicon.ico';
	import appleTouchIcon from '$lib/assets/apple-touch-icon.png';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/png" href={faviconPng} sizes="96x96" />
	<link rel="icon" type="image/svg+xml" href={faviconSvg} />
	<link rel="shortcut icon" href={faviconIco} />
	<link rel="apple-touch-icon" sizes="180x180" href={appleTouchIcon} />
	<meta name="apple-mobile-web-app-title" content="Packages" />
</svelte:head>

<ModeWatcher />
{@render children?.()}
