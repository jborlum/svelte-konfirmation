<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	let prefersReducedMotion = $state(false);
	let visible = $state(false);

	$effect(() => {
		if (browser) {
			const media = window.matchMedia('(prefers-reduced-motion: reduce)');
			prefersReducedMotion = media.matches;
			const handler = (e: MediaQueryListEvent) => (prefersReducedMotion = e.matches);
			media.addEventListener('change', handler);
			return () => media.removeEventListener('change', handler);
		}
	});

	onMount(() => {
		setTimeout(() => (visible = true), 100);
	});
</script>

<div class="flex min-h-screen items-center justify-center bg-[#0f1f3a] px-5 text-[#f0f0f0]">
	<div class="pointer-events-none absolute inset-0 overflow-hidden">
		<div class="absolute -left-32 top-1/4 h-[400px] w-[400px] rounded-full bg-[#1e3a5f]/50 blur-3xl"
		></div>
		<div
			class="absolute -right-32 bottom-1/4 h-[400px] w-[400px] rounded-full bg-[#d4af37]/25 blur-3xl"
		></div>
	</div>

	{#if visible}
		<div
			class="relative text-center"
			class:transition-all={!prefersReducedMotion}
			class:duration-1000={!prefersReducedMotion}
			in:fly={{ y: prefersReducedMotion ? 0 : 16, duration: 1000 }}
		>
			<p class="text-xs font-medium uppercase tracking-[0.3em] text-[#d4af37]">2026</p>
			<h1 class="mt-6 text-3xl font-light tracking-tight text-[#f0f0f0] sm:text-4xl">
				Noget særligt er på vej
			</h1>
			<p class="mx-auto mt-6 max-w-xs text-sm leading-relaxed text-[#b0b0b0]">
				Har du modtaget en invitation?
				<br />
				Brug linket du har fået tilsendt.
			</p>

			<div class="mt-10 flex justify-center">
				<div class="h-px w-16 bg-[#d4af37]"></div>
			</div>
		</div>
	{/if}
</div>
