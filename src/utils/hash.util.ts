import bcrypt from 'bcryptjs'

/**
 * Hashes a password using a provided salt.
 * @param password The plain-text password to hash.
 * @param salt The salt to use for hashing.
 * @returns The hashed password.
 */
export function hashPassword(password: string, salt: string): string {
  return bcrypt.hashSync(password, salt)
}

/**
 * Generates a new salt for password hashing.
 * @param rounds Number of rounds to use for salt generation.
 * @returns The generated salt.
 */
export function generateSalt(rounds: number = 10): string {
  return bcrypt.genSaltSync(rounds)
}

/**
 * Verifies a password against a hashed password.
 * @param password The plain-text password.
 * @param hashedPassword The hashed password to compare against.
 * @returns True if the password matches, false otherwise.
 */
export function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compareSync(password, hashedPassword)
}
