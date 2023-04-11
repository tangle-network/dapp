/**
 * Checks if a note account public key is valid or not
 * @param maybePublicKey The note account public key to check
 * @returns True if the note account public key is valid, false otherwise
 */
export default function isValidPublicKey(maybePublicKey: string): boolean {
  return maybePublicKey.startsWith('0x') && maybePublicKey.length === 130;
}
