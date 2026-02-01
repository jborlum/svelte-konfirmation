import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getOAuthClient, getSheetsClient } from '$lib/server/google';
import { getInviteByCode } from '$lib/invites';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const inviteCode = url.searchParams.get('code');

		if (!inviteCode) {
			return json({ ok: false, error: 'Missing code parameter' }, { status: 400 });
		}

		// Validate invite code exists
		const invite = getInviteByCode(inviteCode);
		if (!invite) {
			return json({ ok: false, error: 'Invalid invite code' }, { status: 400 });
		}

		const refreshToken = env.GOOGLE_OAUTH_REFRESH_TOKEN;
		if (!refreshToken) {
			return json({ ok: false, error: 'Missing GOOGLE_OAUTH_REFRESH_TOKEN' }, { status: 500 });
		}

		const spreadsheetId = env.GOOGLE_SHEETS_SPREADSHEET_ID;
		const range = env.GOOGLE_SHEETS_RANGE ?? 'RSVPs!A:F';

		if (!spreadsheetId) {
			return json({ ok: false, error: 'Missing GOOGLE_SHEETS_SPREADSHEET_ID' }, { status: 500 });
		}

		const oauth = getOAuthClient();
		oauth.setCredentials({ refresh_token: refreshToken });
		const sheets = getSheetsClient(oauth);

		// Read all RSVP data
		const result = await sheets.spreadsheets.values.get({
			spreadsheetId,
			range
		});

		const rows = result.data.values ?? [];

		// Check if this invite code has any submissions
		// Row format: [timestamp, inviteCode, inviteeId, inviteeName, attending, message]
		const submissions = rows.filter((row) => row[1] === inviteCode);
		const hasSubmitted = submissions.length > 0;

		// Get the responses if submitted
		let responses: { id: string; name: string; attending: boolean }[] = [];
		if (hasSubmitted) {
			responses = submissions.map((row) => ({
				id: row[2],
				name: row[3],
				attending: row[4] === 'ja'
			}));
		}

		return json({
			ok: true,
			hasSubmitted,
			responses
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error';
		return json({ ok: false, error: message }, { status: 500 });
	}
};
