<script lang="ts">
	import InvitePage from '$lib/components/InvitePage.svelte';

	let { data } = $props();
</script>

<InvitePage invite={data.invite} />
