import { ulidFactory } from 'ulid-workers'
import basex from 'base-x'
import { createId as createId32, init } from '@paralleldrive/cuid2'
import { bytes2hex } from './buffer.util'

const RESOURCE_SEPARATOR = '_'

export const ulid = ulidFactory()

export const uildNonMonotonic = ulidFactory({ monotonic: false })

export function randomNumber() {
  const secret = new Uint32Array(1)
  crypto.getRandomValues(secret)

  return secret[0]
}

export function makeId(length: number) {
  const result = []
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) result.push(characters.charAt(Math.floor(Math.random() * charactersLength)))

  return result.join('')
}

const base62 = basex('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')

export function randomBase62(length: number) {
  const secretBytes = new Uint8Array(length)
  crypto.getRandomValues(secretBytes)

  return base62.encode(secretBytes)
}

export function randomHex(length: number) {
  const secretBytes = new Uint8Array(length)
  crypto.getRandomValues(secretBytes)

  return bytes2hex(secretBytes)
}

// 16 bytes to produce 32 characters in hex
export function randomTraceId() {
  return randomHex(16)
}

// 8 bytes to produce 16 characters in hex
export function randomSpanId() {
  return randomHex(8)
}

const baseId = basex('abcdefghijklmnopqrstuvwxyz0123456789')

export function randomBaseId(length: number) {
  const secretBytes = new Uint8Array(length)
  crypto.getRandomValues(secretBytes)

  return baseId.encode(secretBytes)
}

const baseDigit = basex('0123456789')

export function randomBaseDigit(length: number) {
  const secretBytes = new Uint8Array(length)
  crypto.getRandomValues(secretBytes)

  return baseDigit.encode(secretBytes)
}

// The init function returns a custom createId function with the specified
// configuration. All configuration properties are optional.
const createId = init({
  // A custom random function with the same API as Math.random.
  // You can use this to pass a cryptographically secure random function.
  // random: Math.random,
  // the length of the id
  length: 16,
  // A custom fingerprint for the host environment. This is used to help
  // prevent collisions when generating ids in a distributed system.
  // fingerprint: 'a-custom-host-fingerprint',
})

// taken from https://unkey.dev/blog/uuid-ux
export const prefixes = {
  user: 'usr',
  secretKey: 'sk',
  keyAuth: 'key_auth', // <-- this is internal and does not need to be short or pretty
  test: 'test', // <-- for tests only
  otp: 'otp',
} as const

export function newId(prefix: keyof typeof prefixes, length: 'short' | 'long' = 'short'): string {
  if (length === 'long') return [prefixes[prefix], createId32()].join(RESOURCE_SEPARATOR)
  else return [prefixes[prefix], createId()].join(RESOURCE_SEPARATOR)
}

export function newULID(prefix: keyof typeof prefixes, timestamp?: number): string {
  return [prefixes[prefix], ulid(timestamp)].join(RESOURCE_SEPARATOR)
}
