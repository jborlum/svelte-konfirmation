<script lang="ts">
	import { browser } from '$app/environment';
	import { burst } from '$lib/confetti';

	interface Props {
		type?: 'button' | 'submit';
		disabled?: boolean;
		class?: string;
		confettiOnClick?: boolean;
		onclick?: () => void;
		children: import('svelte').Snippet;
	}

	let {
		type = 'button',
		disabled = false,
		class: className = '',
		confettiOnClick = true,
		onclick,
		children
	}: Props = $props();

	let prefersReducedMotion = $state(false);

	$effect(() => {
		if (browser) {
			const media = window.matchMedia('(prefers-reduced-motion: reduce)');
			prefersReducedMotion = media.matches;
			const handler = (e: MediaQueryListEvent) => (prefersReducedMotion = e.matches);
			media.addEventListener('change', handler);
			return () => media.removeEventListener('change', handler);
		}
	});

	function handleClick(e: MouseEvent) {
		if (confettiOnClick && !disabled && !prefersReducedMotion) {
			const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
			const x = (rect.left + rect.width / 2) / window.innerWidth;
			const y = (rect.top + rect.height / 2) / window.innerHeight;
			burst(x, y);
		}
		onclick?.();
	}
</script>

<button
	{type}
	{disabled}
	onclick={handleClick}
	class="party-button relative overflow-hidden transition-transform {className}"
	class:hover:scale-102={!prefersReducedMotion}
	class:active:scale-98={!prefersReducedMotion}
>
	<span class="relative z-10">
		{@render children()}
	</span>
</button>

<style>
	.hover\:scale-102:hover {
		transform: scale(1.02);
	}
	.active\:scale-98:active {
		transform: scale(0.98);
	}
</style>
