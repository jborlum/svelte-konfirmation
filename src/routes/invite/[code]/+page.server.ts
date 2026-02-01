import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getInviteByCode, getAllInviteCodes } from '$lib/invites';

export const load: PageServerLoad = async ({ params }) => {
	const invite = getInviteByCode(params.code);

	if (!invite) {
		error(404, 'Invitation ikke fundet');
	}

	return { invite };
};

export const prerender = true;

export function entries() {
	return getAllInviteCodes().map((code) => ({ code }));
}
