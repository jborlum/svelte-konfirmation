<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { fly, fade, scale } from 'svelte/transition';
	import { journeyContent } from '$lib/content';
	import type { InviteGroup } from '$lib/types';
	import { celebration, shower } from '$lib/confetti';
	import { theme } from '$lib/theme';
	import RsvpForm from './RsvpForm.svelte';
	import PartyButton from './animations/PartyButton.svelte';
	import PolaroidPhoto from './animations/PolaroidPhoto.svelte';
	import EnvelopeLetter from './animations/EnvelopeLetter.svelte';
	import FloatingFlags from './animations/FloatingFlags.svelte';

	interface RsvpStatusResponse {
		id: string;
		name: string;
		attending: boolean;
	}

	interface Props {
		invite: InviteGroup;
	}

	let { invite }: Props = $props();

	let toast = $state<{ title: string; message?: string } | null>(null);
	let toastTimer: number | null = null;
	let letterOpen = $state(false);
	let hasOpenedOnce = $state(false);
	let isAtTop = $state(true);
	let prefersReducedMotion = $state(false);
	let rsvpStatus = $state<{
		alreadySubmitted: boolean;
		previousResponses: RsvpStatusResponse[];
	}>({ alreadySubmitted: false, previousResponses: [] });
	let invitationVisible = $state(false);
	let confettiFired = false;
	let invitationSection: HTMLDivElement;

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
		window.scrollTo(0, 0);

		const handleScroll = () => {
			isAtTop = window.scrollY < 100;
		};
		window.addEventListener('scroll', handleScroll, { passive: true });

		// Track page view and check RSVP status
		fetch('/api/track-view', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ inviteCode: invite.code })
		}).catch(() => {});

		fetch(`/api/rsvp/status?code=${encodeURIComponent(invite.code)}`)
			.then((res) => res.json())
			.then((data) => {
				if (data.ok && data.hasSubmitted) {
					rsvpStatus = {
						alreadySubmitted: true,
						previousResponses: data.responses
					};
				}
			})
			.catch(() => {});

		// Preload journey images
		journeyContent.journey.phases.forEach((_, idx) => {
			const img = new Image();
			img.src = `/images/journey/photo-${idx + 1}.jpeg`;
		});

		return () => window.removeEventListener('scroll', handleScroll);
	});

	// Block scrolling until letter has been read, and while letter is open
	$effect(() => {
		if (browser) {
			if (!hasOpenedOnce || letterOpen) {
				document.documentElement.style.overflow = 'hidden';
				document.body.style.overflow = 'hidden';
			} else {
				document.documentElement.style.overflow = '';
				document.body.style.overflow = '';
			}
		}
	});

	// Intersection observer for invitation section
	$effect(() => {
		if (browser && invitationSection) {
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting && !invitationVisible) {
							invitationVisible = true;
							if (!prefersReducedMotion && !confettiFired) {
								confettiFired = true;
								shower();
							}
						}
					});
				},
				{ threshold: 0.4 }
			);
			observer.observe(invitationSection);
			return () => observer.disconnect();
		}
	});

	function showToast(next: { title: string; message?: string }) {
		toast = next;
		if (toastTimer) clearTimeout(toastTimer);
		toastTimer = window.setTimeout(() => (toast = null), 3400);
	}

	function scrollToFirstPhase() {
		const el = document.getElementById('phase-0');
		if (el) {
			el.scrollIntoView({ behavior: 'smooth' });
		}
	}

	function isValidIsoDate(value: string): boolean {
		return Number.isFinite(new Date(value).getTime());
	}

	const invitation = journeyContent.invitation;
	const rsvp = journeyContent.rsvp;
	const wishlist = journeyContent.wishlist;

	const safeStartISO = $derived(
		isValidIsoDate(invitation.when.startISO)
			? invitation.when.startISO
			: '2026-05-17T11:00:00+02:00'
	);
	const safeEndISO = $derived(
		isValidIsoDate(invitation.when.endISO) ? invitation.when.endISO : '2026-05-17T12:30:00+02:00'
	);

	const detailsText = $derived(
		[
			invitation.title,
			invitation.confirmandName,
			'',
			`Hvornaar: ${invitation.when.dateLabel} - ${invitation.when.timeLabel}`,
			`Hvor: ${invitation.where.venueName}`,
			`Adresse: ${invitation.where.addressLines.join(', ')}`,
			invitation.dressCode ? `Paaklaedning: ${invitation.dressCode}` : null
		]
			.filter(Boolean)
			.join('\n')
	);

	const greeting = $derived(
		invite.groupName
			? `Kære ${invite.groupName}`
			: invite.invitees.length === 1
				? `Kære ${invite.invitees[0].name}`
				: `Kære ${invite.invitees.map((i) => i.name).join(' & ')}`
	);

	let openCategory = $state<string | null>(null);

	function handleAddToCalendar() {
		const location = `${invitation.where.venueName}, ${invitation.where.addressLines.join(', ')}`;
		const title = `${invitation.title} - ${invitation.confirmandName}`;
		const startDate = safeStartISO.replace(/[-:]/g, '').replace(/\+.*$/, '');
		const endDate = safeEndISO.replace(/[-:]/g, '').replace(/\+.*$/, '');
		const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(detailsText)}&location=${encodeURIComponent(location)}`;
		window.open(googleCalUrl, '_blank');
	}
</script>

<div class="min-h-screen {theme.text}" style="background-color: {theme.bg}">
	<!-- Fixed background gradient blobs -->
	<div class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
		<div
			class="absolute -left-32 top-1/4 h-[600px] w-[600px] rounded-full {theme.blob1} blur-2xl sm:blur-3xl"
			class:animate-float={!prefersReducedMotion}
			style="animation-duration: 12s"
		></div>
		<div
			class="absolute -right-32 top-1/3 h-[650px] w-[650px] rounded-full {theme.blob2} blur-2xl sm:blur-3xl"
			class:animate-float={!prefersReducedMotion}
			style="animation-duration: 14s; animation-delay: 2s"
		></div>
		<div
			class="absolute -left-20 bottom-1/4 h-[500px] w-[500px] rounded-full {theme.blob2} blur-2xl sm:blur-3xl"
			class:animate-float={!prefersReducedMotion}
			style="animation-duration: 10s; animation-delay: 4s"
		></div>
		<div
			class="absolute -right-24 bottom-1/3 h-[550px] w-[550px] rounded-full {theme.blob1} blur-2xl sm:blur-3xl"
			class:animate-float={!prefersReducedMotion}
			style="animation-duration: 11s; animation-delay: 1s"
		></div>
	</div>

	<!-- Toast -->
	<div
		aria-live="polite"
		aria-atomic="true"
		class="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4"
	>
		{#if toast}
			<div
				class="pointer-events-auto w-full max-w-md rounded-2xl border border-[#d4af37]/50 bg-[#1e3a5f]/95 p-4 shadow-lg backdrop-blur"
				in:fly={{ y: -20, duration: 300 }}
				out:fly={{ y: -20, duration: 300 }}
			>
				<p class="text-sm font-semibold {theme.text}">{toast.title}</p>
				{#if toast.message}
					<p class="mt-1 text-sm {theme.textMuted}">{toast.message}</p>
				{/if}
			</div>
		{/if}
	</div>

	<main class="relative z-10">
		<!-- Hero Section -->
		<section
			id="top"
			aria-label="Opening"
			class="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-16 sm:px-10"
		>
			<div class="pointer-events-none absolute inset-0">
				<FloatingFlags variant="hero" />
			</div>

			<div class="relative z-10 mx-auto w-full max-w-3xl text-center">
				<p
					class="text-lg font-semibold uppercase tracking-[0.2em] sm:text-xl {theme.textSubtle}"
					in:fly={{ y: 30, duration: 600, delay: 200 }}
				>
					{journeyContent.hero.eyebrow}
				</p>

				{#if journeyContent.hero.letter}
					<div class="mt-10" in:fly={{ y: 30, duration: 600, delay: 350 }}>
						<EnvelopeLetter
							letterContent={journeyContent.hero.letter.content}
							signature={journeyContent.hero.letter.signature}
							onFirstOpen={() => {
								hasOpenedOnce = true;
								celebration();
							}}
							onOpen={() => (letterOpen = true)}
							onClose={() => (letterOpen = false)}
							disabled={!isAtTop}
						/>
					</div>
				{/if}

				{#if hasOpenedOnce}
					<div class="mt-10 flex justify-center" in:fly={{ y: 20, duration: 400 }}>
						<button
							onclick={scrollToFirstPhase}
							class="group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 {theme.buttonAlt}"
						>
							{journeyContent.hero.scrollHint}
							<span
								aria-hidden="true"
								class="grid h-6 w-6 place-items-center rounded-full border border-stone-300 bg-white/70"
								class:animate-bounce={!prefersReducedMotion}
								style="animation-duration: 1.5s"
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
									<path
										d="M12 5v14m0 0-6-6m6 6 6-6"
										stroke="currentColor"
										stroke-width="1.6"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</span>
						</button>
					</div>
				{/if}
			</div>
		</section>

		<!-- Journey Sections -->
		{#each journeyContent.journey.phases as phase, index}
			{@const sectionVariants = ['section1', 'section2', 'section3'] as const}
			<section
				id="phase-{index}"
				aria-label={phase.title}
				class="relative flex items-center justify-center px-5 py-12 sm:px-10 sm:py-16"
			>
				<FloatingFlags variant={sectionVariants[index]} />

				<div
					class="relative z-10 mx-auto w-full max-w-md {index % 2 === 0
						? 'md:mr-auto md:ml-16'
						: 'md:ml-auto md:mr-16'}"
				>
					<PolaroidPhoto
						src="/images/journey/photo-{index + 1}.jpeg"
						alt={phase.title}
						slideFrom={index % 2 === 0 ? 'left' : 'right'}
					/>
				</div>
			</section>
		{/each}

		<!-- Invitation Section -->
		<section
			id="invitation"
			aria-label="Invitation"
			class="relative flex min-h-screen items-center justify-center px-5 py-16 sm:px-10"
		>
			<FloatingFlags variant="invitation" />

			<div bind:this={invitationSection} class="mx-auto w-full max-w-5xl">
				{#if invitationVisible}
					<div in:scale={{ start: 0.9, duration: 500 }}>
						<div class="mx-auto max-w-3xl text-center">
							<p
								class="text-xs font-semibold uppercase tracking-[0.26em] {theme.textSubtle}"
								in:fly={{ y: 20, delay: 100, duration: 400 }}
							>
								{invitation.eyebrow}
							</p>
							<h2
								class="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl {theme.text}"
								in:fly={{ y: 20, delay: 200, duration: 400 }}
							>
								{invitation.title}
							</h2>
							<p
								class="mx-auto mt-4 max-w-xl text-lg leading-relaxed {theme.textSubtle}"
								in:fly={{ y: 20, delay: 300, duration: 400 }}
							>
								{greeting}
							</p>
							<p
								class="mx-auto mt-2 max-w-xl text-base leading-relaxed sm:text-lg {theme.textMuted}"
								in:fly={{ y: 20, delay: 400, duration: 400 }}
							>
								{invitation.transitionLine}
							</p>
						</div>

						<div
							class="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-2"
							in:fly={{ y: 30, delay: 500, duration: 500 }}
						>
							<!-- Details Card -->
							<div class="rounded-[32px] border p-6 shadow-sm backdrop-blur sm:p-8 {theme.card}">
								<h3 class="text-2xl font-semibold tracking-tight {theme.text}">Detaljer</h3>
								<dl class="mt-6 grid gap-5 text-sm sm:text-base">
									<div class="grid gap-1">
										<dt
											class="text-xs font-semibold uppercase tracking-[0.22em] {theme.textSubtle}"
										>
											Konfirmand
										</dt>
										<dd class="text-lg font-semibold tracking-tight {theme.text}">
											{invitation.confirmandName}
										</dd>
									</div>

									<div class="grid gap-1">
										<dt
											class="text-xs font-semibold uppercase tracking-[0.22em] {theme.textSubtle}"
										>
											Hvornår
										</dt>
										<dd class="{theme.text}">
											{invitation.when.dateLabel}
											<span class="opacity-40"> - </span>
											{invitation.when.timeLabel}
										</dd>
									</div>

									<div class="grid gap-1">
										<dt
											class="text-xs font-semibold uppercase tracking-[0.22em] {theme.textSubtle}"
										>
											Hvor
										</dt>
										<dd class="{theme.text}">{invitation.where.venueName}</dd>
										<dd class="{theme.textMuted}">{invitation.where.addressLines.join(', ')}</dd>
										<dd class="mt-1">
											<a
												href="https://www.google.com/maps/search/?api=1&query={encodeURIComponent(`${invitation.where.venueName}, ${invitation.where.addressLines.join(', ')}`)}"
												target="_blank"
												rel="noopener noreferrer"
												class="inline-flex items-center gap-1.5 text-sm text-amber-400 hover:underline"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 20 20"
													fill="currentColor"
													class="h-4 w-4"
												>
													<path
														fill-rule="evenodd"
														d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
														clip-rule="evenodd"
													/>
												</svg>
												Vis på kort
											</a>
										</dd>
									</div>

									{#if invitation.dressCode}
										<div class="grid gap-1">
											<dt
												class="text-xs font-semibold uppercase tracking-[0.22em] {theme.textSubtle}"
											>
												Påklædning
											</dt>
											<dd class="{theme.text}">{invitation.dressCode}</dd>
										</div>
									{/if}
								</dl>

								<div class="mt-7">
									<PartyButton
										class="rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm {theme.button}"
										onclick={handleAddToCalendar}
									>
										{invitation.buttons.addToCalendar}
									</PartyButton>
								</div>
							</div>

							<!-- RSVP Form -->
							{#if rsvp?.enabled}
								<div class="rounded-[32px] border p-6 shadow-sm backdrop-blur sm:p-8 {theme.card}">
									<h3 class="text-2xl font-semibold tracking-tight {theme.text}">{rsvp.title}</h3>
									<div class="mt-6">
										<RsvpForm
											{invite}
											{showToast}
											alreadySubmitted={rsvpStatus.alreadySubmitted}
											previousResponses={rsvpStatus.previousResponses}
										/>
									</div>
								</div>
							{/if}

							<!-- Wishlist -->
							{#if wishlist?.enabled}
								<div class="rounded-[32px] border p-6 shadow-sm backdrop-blur sm:p-8 {theme.card}">
									<h3 class="text-2xl font-semibold tracking-tight {theme.text}">
										{wishlist.title}
									</h3>
									{#if wishlist.description}
										<p class="mt-2 {theme.textMuted}">{wishlist.description}</p>
									{/if}

									<div class="mt-6 space-y-2">
										{#each wishlist.categories as category}
											{@const isOpen = openCategory === category.id}
											<div class="rounded-xl border {theme.card}">
												<button
													type="button"
													onclick={() => (openCategory = isOpen ? null : category.id)}
													class="flex w-full items-center justify-between px-4 py-3 text-left transition-opacity hover:opacity-80 {theme.text}"
													aria-expanded={isOpen}
													aria-controls="wishlist-{category.id}"
												>
													<span class="font-medium">{category.title}</span>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														viewBox="0 0 20 20"
														fill="currentColor"
														class="h-5 w-5 transition-transform duration-200"
														class:rotate-180={isOpen}
													>
														<path
															fill-rule="evenodd"
															d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
															clip-rule="evenodd"
														/>
													</svg>
												</button>
												{#if isOpen}
													<div
														id="wishlist-{category.id}"
														class="overflow-hidden"
														in:fly={{ y: -10, duration: 200 }}
														out:fly={{ y: -10, duration: 200 }}
													>
														<ul class="space-y-1 px-4 pb-4 {theme.textMuted}">
															{#each category.items as item, itemIndex}
																<li
																	class="flex items-center gap-2"
																	in:fly={{
																		x: -10,
																		delay: itemIndex * 50,
																		duration: 200
																	}}
																>
																	<span class="text-xs opacity-50">•</span>
																	{item}
																</li>
															{/each}
														</ul>
													</div>
												{/if}
											</div>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		</section>
	</main>
</div>
