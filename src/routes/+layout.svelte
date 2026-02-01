<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Du har fået post</title>
	<meta name="description" content="Noget venter på dig..." />
</svelte:head>

{@render children()}
