<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="flex min-h-screen items-center justify-center bg-[#0f1f3a] px-5 py-16 text-[#f0f0f0]">
	<div class="mx-auto max-w-md text-center">
		<h1 class="text-4xl font-semibold tracking-tight">Invitation ikke fundet</h1>
		<p class="mt-4 text-base leading-relaxed text-[#b0b0b0]">
			Dette invitationslink er ugyldigt eller udløbet. Tjek venligst at du har brugt det korrekte
			link fra din invitation.
		</p>
		<a
			href="/"
			class="mt-8 inline-block rounded-full bg-gradient-to-r from-[#d4af37] to-[#c9a227] px-5 py-2.5 text-sm font-semibold text-[#0f1f3a] shadow-sm transition hover:from-[#e0bc4a] hover:to-[#d4af37] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]"
		>
			Gå til forsiden
		</a>
	</div>
</div>
