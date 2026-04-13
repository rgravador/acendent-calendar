import { OAuth2Client } from 'google-auth-library'

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']

export function createOAuthClient(): OAuth2Client {
  const config = useRuntimeConfig()
  if (!config.googleClientId || !config.googleClientSecret || !config.googleRedirectUri) {
    throw new Error('Google OAuth environment variables are not configured')
  }
  return new OAuth2Client({
    clientId: config.googleClientId,
    clientSecret: config.googleClientSecret,
    redirectUri: config.googleRedirectUri,
  })
}

export function buildAuthUrl(state: string): string {
  const client = createOAuthClient()
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    include_granted_scopes: true,
    state,
  })
}

export async function exchangeCodeForRefreshToken(code: string): Promise<string> {
  const client = createOAuthClient()
  const { tokens } = await client.getToken(code)
  if (!tokens.refresh_token) {
    throw new Error('No refresh token returned from Google. Revoke app access in your Google Account and re-run /setup.')
  }
  return tokens.refresh_token
}

/**
 * Exchange the stored refresh token for a fresh access token.
 */
export async function getAccessToken(refreshToken: string): Promise<string> {
  const client = createOAuthClient()
  client.setCredentials({ refresh_token: refreshToken })
  const { token } = await client.getAccessToken()
  if (!token) throw new Error('Failed to obtain access token')
  return token
}

export function buildAuthenticatedClient(refreshToken: string): OAuth2Client {
  const client = createOAuthClient()
  client.setCredentials({ refresh_token: refreshToken })
  return client
}
