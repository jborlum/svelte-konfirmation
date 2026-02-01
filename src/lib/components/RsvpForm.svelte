<script lang="ts">
	import { browser } from '$app/environment';
	import { fly, fade, scale } from 'svelte/transition';
	import type { InviteGroup } from '$lib/types';
	import { journeyContent } from '$lib/content';
	import { celebration } from '$lib/confetti';
	import PartyButton from './animations/PartyButton.svelte';
	import { theme } from '$lib/theme';

	interface PreviousResponse {
		id: string;
		name: string;
		attending: boolean;
	}

	interface Props {
		invite: InviteGroup;
		showToast: (toast: { title: string; message?: string }) => void;
		alreadySubmitted?: boolean;
		previousResponses?: PreviousResponse[];
	}

	let {
		invite,
		showToast,
		alreadySubmitted = false,
		previousResponses = []
	}: Props = $props();

	const rsvp = journeyContent.rsvp;

	let attending = $state<Record<string, boolean>>(
		Object.fromEntries(invite.invitees.map((inv) => [inv.id, false]))
	);
	let message = $state('');
	let submitting = $state(false);
	let success = $state(false);
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

	function handleToggle(id: string) {
		attending[id] = !attending[id];
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (submitting || success) return;

		submitting = true;
		try {
			const payload = {
				inviteCode: invite.code,
				responses: invite.invitees.map((inv) => ({
					id: inv.id,
					name: inv.name,
					attending: attending[inv.id] ?? false
				})),
				message: message.trim() || undefined
			};

			const res = await fetch('/api/rsvp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			const data = await res.json();
			if (!res.ok || !data.ok) {
				showToast({ title: 'Fejl', message: data.error || 'Kunne ikke sende tilmelding' });
				return;
			}

			success = true;
			showToast({ title: rsvp!.successTitle, message: rsvp!.successMessage });

			if (!prefersReducedMotion) {
				celebration();
			}
		} finally {
			submitting = false;
		}
	}

	const attendingNames = $derived(previousResponses.filter((r) => r.attending).map((r) => r.name));
	const notAttendingNames = $derived(
		previousResponses.filter((r) => !r.attending).map((r) => r.name)
	);
</script>

{#if !rsvp?.enabled}
	<!-- RSVP disabled -->
{:else if alreadySubmitted}
	<div
		class="rounded-2xl border border-[#d4af37]/50 bg-[#d4af37]/20 p-4 text-sm {theme.text}"
		in:scale={{ start: 0.9, duration: 300 }}
	>
		<div class="mb-2 inline-block" in:scale={{ start: 0, delay: 100, duration: 300 }}>
			<svg class="h-6 w-6 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M5 13l4 4L19 7"
				/>
			</svg>
		</div>
		<p class="font-semibold">I har allerede tilmeldt jer</p>
		{#if attendingNames.length > 0}
			<p class="mt-2 {theme.textMuted}">
				<span class="font-medium">Kommer:</span>
				{attendingNames.join(', ')}
			</p>
		{/if}
		{#if notAttendingNames.length > 0}
			<p class="mt-1 {theme.textMuted}">
				<span class="font-medium">Kommer ikke:</span>
				{notAttendingNames.join(', ')}
			</p>
		{/if}
		<p class="mt-4 text-xs {theme.textMuted}">Tag kontakt hvis I vil ændre jeres tilmelding.</p>
	</div>
{:else if success}
	<div
		class="rounded-2xl border border-[#d4af37]/50 bg-[#d4af37]/20 p-4 text-sm {theme.text}"
		in:scale={{ start: 0.9, duration: 300 }}
	>
		<div class="mb-2 inline-block" in:scale={{ start: 0, delay: 100, duration: 300 }}>
			<svg class="h-6 w-6 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M5 13l4 4L19 7"
				/>
			</svg>
		</div>
		<p class="font-semibold">{rsvp.successTitle}</p>
		<p class="mt-1 {theme.textMuted}">{rsvp.successMessage}</p>
	</div>
{:else}
	<form class="grid gap-5" onsubmit={handleSubmit}>
		<div class="grid gap-3">
			<span class="text-sm font-medium {theme.text}">{rsvp.fields.whoIsComingLabel}</span>
			<div class="grid gap-2">
				{#each invite.invitees as invitee, index}
					<label
						class="flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition {theme.checkboxLabel} {attending[
							invitee.id
						]
							? 'ring-2 ring-amber-400'
							: ''}"
						class:hover:scale-102={!prefersReducedMotion}
						in:fly={{ x: -20, delay: index * 100, duration: 300 }}
					>
						<div class="relative">
							<input
								type="checkbox"
								checked={attending[invitee.id] ?? false}
								onchange={() => handleToggle(invitee.id)}
								class="checkbox-bounce h-5 w-5 rounded {theme.checkbox} focus:ring-amber-400"
							/>
						</div>
						<span class="text-sm {theme.text}">{invitee.name}</span>
					</label>
				{/each}
			</div>
		</div>

		<label class="grid gap-1" in:fly={{ y: 10, delay: 300, duration: 300 }}>
			<span class="text-sm font-medium {theme.text}">{rsvp.fields.messageLabel}</span>
			<textarea
				class="h-24 resize-none rounded-2xl border border-[#d4af37] px-3 py-2 text-sm outline-none transition-shadow focus:ring-2 focus:ring-[#d4af37] {theme.input}"
				bind:value={message}
				placeholder="Skriv en hilsen..."
				maxlength={500}
			></textarea>
		</label>

		<div class="flex flex-wrap items-center gap-3" in:fly={{ y: 10, delay: 400, duration: 300 }}>
			<PartyButton
				type="submit"
				disabled={submitting}
				class="rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:cursor-not-allowed disabled:opacity-60 {theme.button}"
				confettiOnClick={false}
			>
				{submitting ? rsvp.submittingLabel : rsvp.submitLabel}
			</PartyButton>
		</div>
	</form>
{/if}

<style>
	.hover\:scale-102:hover {
		transform: scale(1.02);
	}
</style>
