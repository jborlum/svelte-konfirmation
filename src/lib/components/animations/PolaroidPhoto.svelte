<script lang="ts">
	import { browser } from '$app/environment';

	interface Props {
		src: string;
		alt: string;
		class?: string;
		slideFrom?: 'left' | 'right';
	}

	let { src, alt, class: className = '', slideFrom = 'right' }: Props = $props();

	let prefersReducedMotion = $state(false);
	let containerEl: HTMLDivElement;

	$effect(() => {
		if (browser) {
			const media = window.matchMedia('(prefers-reduced-motion: reduce)');
			prefersReducedMotion = media.matches;
			const handler = (e: MediaQueryListEvent) => (prefersReducedMotion = e.matches);
			media.addEventListener('change', handler);
			return () => media.removeEventListener('change', handler);
		}
	});

	const baseRotation = $derived(slideFrom === 'left' ? -6 : 6);

	let scrollOffset = $state(1);
	const scrollRotation = $derived(baseRotation * scrollOffset);

	$effect(() => {
		if (browser && containerEl && !prefersReducedMotion) {
			const handleScroll = () => {
				const rect = containerEl.getBoundingClientRect();
				const viewportHeight = window.innerHeight;
				// Calculate how far from viewport center (0 = center, -1 = top, 1 = bottom)
				const elementCenter = rect.top + rect.height / 2;
				const viewportCenter = viewportHeight / 2;
				const offsetFromCenter = (elementCenter - viewportCenter) / viewportCenter;
				// Clamp to [-1, 1] range
				scrollOffset = Math.max(-1, Math.min(1, offsetFromCenter));
			};
			window.addEventListener('scroll', handleScroll, { passive: true });
			handleScroll();
			return () => window.removeEventListener('scroll', handleScroll);
		}
	});

</script>

<div bind:this={containerEl} class="relative {className}">
	<div
		class="relative overflow-hidden rounded-lg bg-white p-3 shadow-xl"
		style="transform: rotate({scrollRotation}deg)"
		role="img"
	>
		<div class="relative overflow-hidden rounded">
			<div class="relative h-[280px] w-full sm:h-[340px]">
				<img {src} {alt} class="h-full w-full object-cover" loading="eager" />
			</div>

			<div
				class="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-white/20"
			></div>
		</div>
	</div>
</div>
