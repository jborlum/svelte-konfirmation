<script lang="ts">
	import { browser } from '$app/environment';
	import { fly, fade, scale } from 'svelte/transition';
	import { spring } from 'svelte/motion';
	import { burst } from '$lib/confetti';

	interface Props {
		letterContent: string;
		signature: string;
		onFirstOpen?: () => void;
		onOpen?: () => void;
		onClose?: () => void;
		disabled?: boolean;
	}

	let {
		letterContent,
		signature,
		onFirstOpen,
		onOpen,
		onClose,
		disabled = false
	}: Props = $props();

	let isOpen = $state(false);
	let hasBeenOpened = $state(false);
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

	const envelopeScale = spring(1, { stiffness: 0.2, damping: 0.7 });
	const envelopeY = spring(0, { stiffness: 0.2, damping: 0.7 });
	const flapRotation = spring(0, { stiffness: 0.15, damping: 0.6 });
	const sealScale = spring(1, { stiffness: 0.2, damping: 0.7 });

	function handleOpen() {
		if (!isOpen && !disabled) {
			isOpen = true;
			onOpen?.();
			if (!hasBeenOpened) {
				hasBeenOpened = true;
				onFirstOpen?.();
			}
			if (!prefersReducedMotion) {
				burst();
				envelopeY.set(20);
				flapRotation.set(180);
				sealScale.set(0);
			}
		}
	}

	function handleClose() {
		isOpen = false;
		onClose?.();
		if (!prefersReducedMotion) {
			envelopeY.set(0);
			flapRotation.set(0);
			sealScale.set(1);
		}
	}

	function handleEnvelopeHover(hovering: boolean) {
		if (!isOpen && !prefersReducedMotion) {
			envelopeScale.set(hovering ? 1.05 : 1);
		}
	}

	const particles = [0, 1, 2, 3, 4, 5];
</script>

<div class="relative flex flex-col items-center">
	<!-- Envelope -->
	<div
		class="relative cursor-pointer select-none"
		onclick={handleOpen}
		onkeydown={(e) => e.key === 'Enter' && handleOpen()}
		onmouseenter={() => handleEnvelopeHover(true)}
		onmouseleave={() => handleEnvelopeHover(false)}
		role="button"
		tabindex="0"
		aria-label="Åbn brev"
	>
		<!-- Envelope body -->
		<div
			class="relative h-48 w-72 sm:h-52 sm:w-80"
			style="transform: scale({$envelopeScale}) translateY({$envelopeY}px); opacity: {isOpen
				? 0.3
				: 1}; transition: opacity 0.5s ease-out"
		>
			<!-- Back of envelope -->
			<div
				class="absolute inset-0 rounded-xl border border-amber-300/50 bg-gradient-to-br from-amber-100 to-amber-200 shadow-lg"
			></div>

			<!-- Envelope flap (triangular top) -->
			<div
				class="absolute -top-0 left-0 right-0 h-24 origin-bottom"
				style="clip-path: polygon(0 100%, 50% 0, 100% 100%); transform-style: preserve-3d; transform: rotateX({$flapRotation}deg) translateY({$flapRotation > 90 ? -10 : 0}px)"
			>
				<div
					class="absolute inset-0 border-t border-amber-300/50 bg-gradient-to-b from-amber-200 to-amber-100"
				></div>
				<div
					class="absolute inset-0 bg-gradient-to-b from-amber-50 to-amber-100"
					style="transform: rotateX(180deg); backface-visibility: hidden"
				></div>
			</div>

			<!-- Envelope front bottom triangle -->
			<div
				class="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-amber-200 to-amber-100"
				style="clip-path: polygon(0 0, 50% 100%, 100% 0, 100% 100%, 0 100%)"
			></div>

			<!-- Wax seal -->
			<div
				class="absolute left-1/2 top-1/2 z-10"
				style="transform: translate(-50%, -50%) scale({$sealScale}) rotate({(1 - $sealScale) * 180}deg)"
			>
				<div class="relative">
					<div
						class="flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-400 bg-gradient-to-br from-red-500 to-red-700 shadow-lg"
					>
						<span class="font-serif text-xl font-bold text-amber-100">H</span>
					</div>
					<!-- Wax drips -->
					<div class="absolute -bottom-1 left-2 h-4 w-3 rounded-full bg-red-600"></div>
					<div class="absolute -bottom-2 right-3 h-3 w-2 rounded-full bg-red-600"></div>
				</div>
			</div>

			<!-- Sparkle effects when hovering -->
			{#if !isOpen && !prefersReducedMotion}
				<div
					class="absolute -right-2 -top-2 h-4 w-4 animate-pulse rounded-full bg-amber-400"
					style="animation-duration: 2s"
				></div>
				<div
					class="absolute -bottom-1 -left-1 h-3 w-3 animate-pulse rounded-full bg-amber-300"
					style="animation-duration: 1.5s; animation-delay: 0.5s"
				></div>
				<div
					class="absolute -right-3 top-1/3 h-2 w-2 animate-pulse rounded-full bg-yellow-400"
					style="animation-duration: 1.8s; animation-delay: 0.3s"
				></div>
			{/if}
		</div>

		<!-- Click hint -->
		{#if !isOpen}
			<p
				class="mt-4 text-sm text-[#b0b0b0]"
				class:animate-pulse={!prefersReducedMotion}
				style="animation-duration: 2s"
			>
				Tryk for at åbne
			</p>
		{/if}
	</div>

	<!-- Backdrop when letter is open -->
	{#if isOpen}
		<div
			class="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm"
			onclick={handleClose}
			onkeydown={(e) => e.key === 'Escape' && handleClose()}
			role="button"
			tabindex="0"
			aria-label="Luk brev"
			transition:fade={{ duration: 200 }}
		></div>
	{/if}

	<!-- Letter that emerges -->
	{#if isOpen}
		<div
			class="fixed left-1/2 top-1/2 z-[9999] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2"
			transition:fly={{ y: -100, duration: 400 }}
		>
			<div
				class="relative cursor-pointer rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50 via-white to-amber-50 p-6 shadow-2xl sm:p-8"
				onclick={handleClose}
				onkeydown={(e) => e.key === 'Escape' && handleClose()}
				role="button"
				tabindex="0"
			>
				<!-- Decorative corner flourishes -->
				<div
					class="absolute left-3 top-3 h-8 w-8 rounded-tl-lg border-l-2 border-t-2 border-amber-300/50"
				></div>
				<div
					class="absolute right-3 top-3 h-8 w-8 rounded-tr-lg border-r-2 border-t-2 border-amber-300/50"
				></div>
				<div
					class="absolute bottom-3 left-3 h-8 w-8 rounded-bl-lg border-b-2 border-l-2 border-amber-300/50"
				></div>
				<div
					class="absolute bottom-3 right-3 h-8 w-8 rounded-br-lg border-b-2 border-r-2 border-amber-300/50"
				></div>

				<!-- Letter content -->
				<div class="relative">
					<div in:fade={{ delay: 300, duration: 500 }}>
						<p
							class="whitespace-pre-line text-left font-serif text-base leading-relaxed text-slate-700 sm:text-lg"
						>
							{letterContent}
						</p>

						<p
							class="mt-6 text-right font-serif text-lg italic text-amber-700 sm:text-xl"
							in:fly={{ x: 20, delay: 500, duration: 400 }}
						>
							{signature}
						</p>
					</div>
				</div>

				<!-- Floating particles around letter -->
				{#if !prefersReducedMotion}
					{#each particles as i}
						<div
							class="absolute h-2 w-2 animate-bounce rounded-full"
							style="background: {i % 2 === 0 ? '#fbbf24' : '#3b82f6'}; left: {10 +
								i * 15}%; top: {20 + (i % 3) * 30}%; animation-duration: {2 +
								i * 0.3}s; animation-delay: {i * 0.2}s"
						></div>
					{/each}
				{/if}
			</div>
		</div>
	{/if}
</div>
