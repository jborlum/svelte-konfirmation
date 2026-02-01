import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { getOAuthClient, getSheetsClient } from '$lib/server/google';
import { getInviteByCode } from '$lib/invites';
import { env } from '$env/dynamic/private';

const TrackViewSchema = z.object({
	inviteCode: z.string().min(1).max(20)
});

export const POST: RequestHandler = async ({ request }) => {
	try {
		const refreshToken = env.GOOGLE_OAUTH_REFRESH_TOKEN;
		if (!refreshToken) {
			return json({ ok: false, error: 'Missing GOOGLE_OAUTH_REFRESH_TOKEN' }, { status: 500 });
		}

		const body = await request.json();
		const parsed = TrackViewSchema.safeParse(body);
		if (!parsed.success) {
			return json({ ok: false, error: 'Invalid input' }, { status: 400 });
		}

		const { inviteCode } = parsed.data;

		// Validate invite code exists
		const invite = getInviteByCode(inviteCode);
		if (!invite) {
			return json({ ok: false, error: 'Invalid invite code' }, { status: 400 });
		}

		const spreadsheetId = env.GOOGLE_SHEETS_SPREADSHEET_ID;
		const range = env.GOOGLE_SHEETS_VIEWS_RANGE ?? 'PageViews!A:D';

		if (!spreadsheetId) {
			return json({ ok: false, error: 'Missing GOOGLE_SHEETS_SPREADSHEET_ID' }, { status: 500 });
		}

		const oauth = getOAuthClient();
		oauth.setCredentials({ refresh_token: refreshToken });
		const sheets = getSheetsClient(oauth);

		const timestamp = new Date().toISOString();
		const groupName = invite.groupName ?? invite.invitees.map((i) => i.name).join(' & ');

		// Create row: [timestamp, inviteCode, groupName, inviteeNames]
		const row = [timestamp, inviteCode, groupName, invite.invitees.map((i) => i.name).join(', ')];

		await sheets.spreadsheets.values.append({
			spreadsheetId,
			range,
			valueInputOption: 'USER_ENTERED',
			insertDataOption: 'INSERT_ROWS',
			requestBody: {
				values: [row]
			}
		});

		return json({ ok: true });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error';
		console.error('Track view error:', message);
		return json({ ok: false, error: message }, { status: 500 });
	}
};
