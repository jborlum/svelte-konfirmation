<script lang="ts">
	import { browser } from '$app/environment';

	interface FlagConfig {
		left?: string;
		right?: string;
		top?: string;
		bottom?: string;
		size: string;
		delay: number;
		duration: number;
		mobileOnly?: boolean;
	}

	interface Props {
		variant?: 'hero' | 'section1' | 'section2' | 'section3' | 'invitation';
	}

	let { variant = 'hero' }: Props = $props();

	const flagVariants: Record<string, FlagConfig[]> = {
		hero: [
			{ left: '36%', top: '10%', size: 'w-14 h-10', delay: 0, duration: 7 },
			{ left: '10%', top: '65%', size: 'w-16 h-12', delay: 0.8, duration: 6.5 },
			{ right: '10%', top: '50%', size: 'w-14 h-10', delay: 0.5, duration: 6, mobileOnly: false },
			{ left: '20%', top: '35%', size: 'w-12 h-9', delay: 1.5, duration: 8, mobileOnly: false },
			{ right: '20%', top: '15%', size: 'w-12 h-9', delay: 2, duration: 7.5, mobileOnly: false },
			{ right: '40%', top: '80%', size: 'w-16 h-12', delay: 1.2, duration: 8, mobileOnly: false }
		],
		section1: [
			{ left: '6%', top: '88%', size: 'w-12 h-9', delay: 1, duration: 7 },
			{ right: '14%', top: '15%', size: 'w-14 h-10', delay: 0, duration: 8.5 },
			{ right: '6%', top: '88%', size: 'w-12 h-9', delay: 0.7, duration: 7 },
			{ left: '30%', top: '12%', size: 'w-16 h-12', delay: 0.3, duration: 7.5, mobileOnly: false },
			{ left: '18%', top: '30%', size: 'w-14 h-10', delay: 1.8, duration: 6.5, mobileOnly: false },
			{ right: '16%', top: '60%', size: 'w-16 h-12', delay: 2.2, duration: 6, mobileOnly: false }
		],
		section2: [
			{ left: '4%', top: '18%', size: 'w-12 h-9', delay: 0.5, duration: 6.5 },
			{ left: '70%', top: '82%', size: 'w-14 h-10', delay: 0, duration: 7 },
			{ right: '25%', top: '15%', size: 'w-16 h-12', delay: 2, duration: 6 },
			{ left: '15%', top: '30%', size: 'w-16 h-12', delay: 1.2, duration: 8, mobileOnly: false },
			{ right: '20%', top: '38%', size: 'w-12 h-9', delay: 1.5, duration: 7.5, mobileOnly: false },
			{ right: '57%', top: '70%', size: 'w-14 h-10', delay: 0.8, duration: 8.5, mobileOnly: false }
		],
		section3: [
			{ left: '6%', top: '8%', size: 'w-14 h-10', delay: 1, duration: 7 },
			{ left: '24%', top: '72%', size: 'w-16 h-12', delay: 1.8, duration: 8 },
			{ right: '3%', top: '22%', size: 'w-12 h-9', delay: 0.5, duration: 7.5 },
			{ left: '22%', top: '40%', size: 'w-12 h-9', delay: 0.2, duration: 6.5, mobileOnly: false },
			{ right: '17%', top: '55%', size: 'w-14 h-10', delay: 2.5, duration: 6, mobileOnly: false },
			{ right: '7%', top: '85%', size: 'w-16 h-12', delay: 0, duration: 7, mobileOnly: false }
		],
		invitation: [
			{ left: '5%', top: '15%', size: 'w-16 h-12', delay: 0.8, duration: 8 },
			{ left: '6%', top: '75%', size: 'w-12 h-9', delay: 1.5, duration: 6.5 },
			{ right: '4%', top: '20%', size: 'w-14 h-10', delay: 2.2, duration: 7.5 },
			{ left: '19%', top: '42%', size: 'w-14 h-10', delay: 0, duration: 7, mobileOnly: false },
			{ right: '15%', top: '58%', size: 'w-16 h-12', delay: 0.3, duration: 8.5, mobileOnly: false },
			{ right: '5%', top: '85%', size: 'w-12 h-9', delay: 1, duration: 6, mobileOnly: false }
		]
	};

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

	const flags = $derived(flagVariants[variant] || flagVariants.hero);
</script>

<div class="pointer-events-none absolute inset-0 overflow-hidden">
	{#each flags as config, i}
		<div
			class="absolute {config.size} {config.mobileOnly === false ? 'hidden sm:block' : ''}"
			style="left: {config.left}; right: {config.right}; top: {config.top}; bottom: {config.bottom}; will-change: transform, opacity; {prefersReducedMotion
				? 'opacity: 0.6'
				: `animation: flag-float ${config.duration}s ease-in-out infinite; animation-delay: ${config.delay}s`}"
		>
			<svg
				viewBox="0 0 37 28"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				class="h-full w-full"
				style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
			>
				<rect width="37" height="28" rx="2" fill="#C8102E" />
				<rect x="0" y="10" width="37" height="8" fill="white" />
				<rect x="10" y="0" width="8" height="28" fill="white" />
			</svg>
		</div>
	{/each}
</div>
