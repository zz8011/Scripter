// Casdoor SDK is client-side only - dynamic import
export async function getCasdoorSDK() {
  const CasdoorSDK = await import('casdoor-js-sdk')

  const config = {
    endpoint: process.env.CASDOOR_ENDPOINT!,
    clientId: process.env.CASDOOR_CLIENT_ID!,
    clientSecret: process.env.CASDOOR_CLIENT_SECRET!,
    appName: 'scripter',
    organization: 'scripter',
  }

  return new CasdoorSDK.default(config)
}

// For backward compatibility
export const casdoor = {
  getOAuthLink: async (...args: any[]) => {
    const sdk = await getCasdoorSDK()
    // @ts-ignore
    return sdk.getOAuthLink(...args)
  },
  getAuthToken: async (...args: any[]) => {
    const sdk = await getCasdoorSDK()
    // @ts-ignore
    return sdk.getAuthToken(...args)
  },
  parseJwtToken: async (...args: any[]) => {
    const sdk = await getCasdoorSDK()
    // @ts-ignore
    return sdk.parseJwtToken(...args)
  },
}

export function getOAuthURL(codeChallenge: string) {
  return casdoor.getOAuthLink(
    process.env.CASDOOR_CALLBACK_URL!,
    codeChallenge,
    ['openid', 'profile', 'email']
  )
}

export async function exchangeToken(code: string, state: string, codeVerifier?: string) {
  return await casdoor.getAuthToken(code, state, codeVerifier)
}

export async function getUserInfo(token: string) {
  return await casdoor.parseJwtToken(token)
}
