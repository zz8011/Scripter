import { createHash, randomBytes } from 'crypto'

export function generateCodeVerifier() {
  return randomBytes(32).toString('base64url')
}

export function generateCodeChallenge(verifier: string) {
  return createHash('sha256').update(verifier).digest('base64url')
}
