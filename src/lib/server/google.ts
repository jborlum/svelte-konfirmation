import { google } from 'googleapis';
import { env } from '$env/dynamic/private';

export function getOAuthClient(params: { redirectUri?: string } = {}) {
	const clientId = env.GOOGLE_OAUTH_CLIENT_ID;
	const clientSecret = env.GOOGLE_OAUTH_CLIENT_SECRET;

	if (!clientId || !clientSecret) {
		throw new Error('Missing Google OAuth credentials');
	}

	const oauth = new google.auth.OAuth2(clientId, clientSecret, params.redirectUri);

	const refreshToken = env.GOOGLE_OAUTH_REFRESH_TOKEN;
	if (refreshToken) {
		oauth.setCredentials({ refresh_token: refreshToken });
	}

	return oauth;
}

export function getSheetsClient(auth: ReturnType<typeof getOAuthClient>) {
	return google.sheets({ version: 'v4', auth });
}
