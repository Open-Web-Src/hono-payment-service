// https://stackoverflow.com/a/69377576
export function bytes2hex(bytes: Uint8Array) {
  return Array.prototype.map.call(bytes, byte => `0${byte.toString(16)}`.slice(-2)).join('')
}

// Utility function to generate HMAC-SHA256 using Web Crypto API (Cloudflare-compatible)
export async function generateHmac(secret: string, message: string) {
  const encoder = new TextEncoder()

  // Encode the secret and message for Web Crypto API processing
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(message)

  // Import the secret key in the required format
  const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])

  // Generate the HMAC signature
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)

  // Convert the signature ArrayBuffer to a hexadecimal string for comparison
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Utility function to encode Base64Url
 */
export function base64UrlEncode(data: string | Uint8Array) {
  return btoa(typeof data === 'string' ? data : String.fromCharCode(...data))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export function decodeBase64(input: string): Uint8Array {
  // Clean input by removing whitespace and ensuring base64 encoding format
  const sanitized = input.replace(/-/g, '+').replace(/_/g, '/').replace(/\s+/g, '')

  // Add necessary padding
  const padded = sanitized.padEnd(sanitized.length + ((4 - (sanitized.length % 4)) % 4), '=')

  try {
    return Uint8Array.from(atob(padded), c => c.charCodeAt(0))
  } catch (error) {
    console.error('Base64 decoding failed:', error)
    throw new Error('Invalid base64-encoded data.')
  }
}
