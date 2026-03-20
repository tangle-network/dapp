import { useCallback, useEffect, useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { keccak256, toBytes } from 'viem';
import { encryptData, decryptData } from '../../utils/payments/keyEncryption';

// Single signature derives both the shielded key and the encryption key
// via domain-separated hashing. No need for two prompts.
const SIGN_MESSAGE =
  'Sign this message to access your Tangle shielded account. This signature is used locally and never sent to any server.';

// Domain separation for key derivation vs. encryption
const deriveShieldedKey = (signature: string): string =>
  keccak256(toBytes(signature + ':shielded-key'));

const deriveEncryptionInput = (signature: string): string =>
  keccak256(toBytes(signature + ':encryption'));

export interface ShieldedKeypair {
  privateKey: string;
}

const STORAGE_KEY = 'tangle-shielded-kp-enc';

const useKeypair = () => {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [keypair, setKeypair] = useState<ShieldedKeypair | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasStoredKeypair, setHasStoredKeypair] = useState(false);

  // Check storage on mount/address change
  useEffect(() => {
    setKeypair(null);
    setHasStoredKeypair(
      !!address && localStorage.getItem(`${STORAGE_KEY}:${address}`) !== null,
    );
  }, [address]);

  const signAndDerive = useCallback(async () => {
    if (!address) {
      setError('Wallet not connected');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const signature = await signMessageAsync({ message: SIGN_MESSAGE });
      const privateKey = deriveShieldedKey(signature);
      const encInput = deriveEncryptionInput(signature);
      return { privateKey, encInput, signature };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signature rejected');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [address, signMessageAsync]);

  const deriveKeypair = useCallback(async () => {
    const result = await signAndDerive();
    if (!result || !address) return null;

    const kp: ShieldedKeypair = { privateKey: result.privateKey };

    try {
      const encrypted = await encryptData(JSON.stringify(kp), result.encInput);
      localStorage.setItem(`${STORAGE_KEY}:${address}`, encrypted);
      setHasStoredKeypair(true);
    } catch {
      // Encryption failed — still usable in-memory for this session
    }

    setKeypair(kp);
    return kp;
  }, [address, signAndDerive]);

  const unlockKeypair = useCallback(async () => {
    if (!address) return null;

    const stored = localStorage.getItem(`${STORAGE_KEY}:${address}`);
    if (!stored) return null;

    const result = await signAndDerive();
    if (!result) return null;

    try {
      const decrypted = await decryptData(stored, result.encInput);
      const parsed = JSON.parse(decrypted);
      if (!parsed?.privateKey || typeof parsed.privateKey !== 'string') {
        throw new Error('Invalid keypair data');
      }
      const kp = parsed as ShieldedKeypair;
      setKeypair(kp);
      return kp;
    } catch {
      setError(
        'Failed to unlock — data may be corrupted. Derive a new keypair.',
      );
      return null;
    }
  }, [address, signAndDerive]);

  const clearKeypair = useCallback(() => {
    if (address) {
      localStorage.removeItem(`${STORAGE_KEY}:${address}`);
      setHasStoredKeypair(false);
    }
    setKeypair(null);
  }, [address]);

  return {
    keypair,
    deriveKeypair,
    unlockKeypair,
    clearKeypair,
    isLoading,
    error,
    hasDerivedKeypair: keypair !== null,
    hasStoredKeypair,
  };
};

export default useKeypair;
