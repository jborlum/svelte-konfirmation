import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { getOAuthClient, getSheetsClient } from '$lib/server/google';
import { getInviteByCode } from '$lib/invites';
import { env } from '$env/dynamic/private';

const InviteeResponseSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1).max(120),
	attending: z.boolean()
});

const RsvpSchema = z
	.object({
		inviteCode: z.string().min(1).max(20),
		responses: z.array(InviteeResponseSchema).min(1),
		message: z.string().trim().max(500).optional(),
		company: z.string().optional().or(z.literal(''))
	})
	.strict();

export const POST: RequestHandler = async ({ request }) => {
	try {
		const refreshToken = env.GOOGLE_OAUTH_REFRESH_TOKEN;
		if (!refreshToken) {
			return json({ ok: false, error: 'Missing GOOGLE_OAUTH_REFRESH_TOKEN' }, { status: 500 });
		}

		const body = await request.json();
		const parsed = RsvpSchema.safeParse(body);
		if (!parsed.success) {
			return json(
				{ ok: false, error: 'Invalid input', details: parsed.error.flatten() },
				{ status: 400 }
			);
		}

		// Bot trap check
		if (parsed.data.company && parsed.data.company.trim().length > 0) {
			return json({ ok: true });
		}

		const { inviteCode, responses, message } = parsed.data;

		// Validate invite code exists
		const invite = getInviteByCode(inviteCode);
		if (!invite) {
			return json({ ok: false, error: 'Invalid invite code' }, { status: 400 });
		}

		// Validate all invitee IDs belong to this invite
		const validIds = new Set(invite.invitees.map((i) => i.id));
		for (const response of responses) {
			if (!validIds.has(response.id)) {
				return json({ ok: false, error: 'Invalid invitee ID' }, { status: 400 });
			}
		}

		const spreadsheetId = env.GOOGLE_SHEETS_SPREADSHEET_ID;
		const range = env.GOOGLE_SHEETS_RANGE ?? 'RSVPs!A:F';

		if (!spreadsheetId) {
			return json({ ok: false, error: 'Missing GOOGLE_SHEETS_SPREADSHEET_ID' }, { status: 500 });
		}

		const oauth = getOAuthClient();
		oauth.setCredentials({ refresh_token: refreshToken });
		const sheets = getSheetsClient(oauth);

		const timestamp = new Date().toISOString();

		// Create one row per invitee response
		const rows = responses.map((response) => [
			timestamp,
			inviteCode,
			response.id,
			response.name,
			response.attending ? 'ja' : 'nej',
			message ?? ''
		]);

		const result = await sheets.spreadsheets.values.append({
			spreadsheetId,
			range,
			valueInputOption: 'USER_ENTERED',
			insertDataOption: 'INSERT_ROWS',
			requestBody: {
				values: rows
			}
		});

		return json({
			ok: true,
			updates: result.data.updates ?? null
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error';
		return json({ ok: false, error: message }, { status: 500 });
	}
};
