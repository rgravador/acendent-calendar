import { OAuth2Client } from 'google-auth-library'

const SCOPES = [
  'openid',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/calendar.readonly',
]

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

export function buildLoginUrl(state: string): string {
  const client = createOAuthClient()
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    include_granted_scopes: true,
    state,
  })
}

export interface GoogleTokenResult {
  refreshToken: string
  idToken: string
}

export async function exchangeCodeForTokens(code: string): Promise<GoogleTokenResult> {
  const client = createOAuthClient()
  const { tokens } = await client.getToken(code)
  if (!tokens.refresh_token) {
    throw new Error('No refresh token returned from Google. Revoke app access in your Google Account and try again.')
  }
  if (!tokens.id_token) {
    throw new Error('No ID token returned from Google.')
  }
  return { refreshToken: tokens.refresh_token, idToken: tokens.id_token }
}

export interface GoogleUserInfo {
  sub: string
  email: string
  name: string
  picture?: string
}

export async function verifyIdToken(idToken: string): Promise<GoogleUserInfo> {
  const config = useRuntimeConfig()
  const client = createOAuthClient()
  const ticket = await client.verifyIdToken({
    idToken,
    audience: config.googleClientId,
  })
  const payload = ticket.getPayload()
  if (!payload || !payload.sub || !payload.email) {
    throw new Error('Invalid ID token payload')
  }
  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name ?? payload.email,
    ...(payload.picture ? { picture: payload.picture } : {}),
  }
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
