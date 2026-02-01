import type { InviteGroup } from './types';
import invitesData from './data/invites.json';

export function getInviteByCode(code: string): InviteGroup | null {
	const invite = invitesData.invites.find((inv) => inv.code === code);
	return invite ?? null;
}

export function getAllInviteCodes(): string[] {
	return invitesData.invites.map((inv) => inv.code);
}
