import { useCallback, useEffect, useRef, useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { keccak256, toBytes } from 'viem';
import { encryptData, decryptData } from '../../utils/payments/keyEncryption';

const SIGN_MESSAGE =
  'Sign this message to access your Tangle shielded account. This signature is used locally and never sent to any server.';

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

  // Track current address to detect stale async completions
  const addressRef = useRef(address);
  useEffect(() => {
    addressRef.current = address;
  }, [address]);

  useEffect(() => {
    queueMicrotask(() => {
      setKeypair(null);
      setError(null);
      setIsLoading(false); // Cancel any stuck loading state from previous address
      setHasStoredKeypair(
        !!address && localStorage.getItem(`${STORAGE_KEY}:${address}`) !== null,
      );
    });
  }, [address]);

  const deriveKeypair = useCallback(async () => {
    const callerAddress = address;
    if (!callerAddress) {
      setError('Wallet not connected');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const signature = await signMessageAsync({ message: SIGN_MESSAGE });

      // Guard: address changed while waiting for signature
      if (addressRef.current !== callerAddress) return null;

      const privateKey = deriveShieldedKey(signature);
      const encInput = deriveEncryptionInput(signature);
      const kp: ShieldedKeypair = { privateKey };

      try {
        const encrypted = await encryptData(JSON.stringify(kp), encInput);
        localStorage.setItem(`${STORAGE_KEY}:${callerAddress}`, encrypted);
        if (addressRef.current === callerAddress) {
          setHasStoredKeypair(true);
        }
      } catch {
        // Encryption failed — usable in-memory only
      }

      if (addressRef.current === callerAddress) {
        setKeypair(kp);
        return kp;
      }
      return null;
    } catch (err) {
      if (addressRef.current === callerAddress) {
        setError(err instanceof Error ? err.message : 'Signature rejected');
      }
      return null;
    } finally {
      if (addressRef.current === callerAddress) {
        setIsLoading(false);
      }
    }
  }, [address, signMessageAsync]);

  const unlockKeypair = useCallback(async () => {
    const callerAddress = address;
    if (!callerAddress) return null;

    const stored = localStorage.getItem(`${STORAGE_KEY}:${callerAddress}`);
    if (!stored) return null;

    setIsLoading(true);
    setError(null);

    try {
      const signature = await signMessageAsync({ message: SIGN_MESSAGE });

      if (addressRef.current !== callerAddress) return null;

      const encInput = deriveEncryptionInput(signature);
      const decrypted = await decryptData(stored, encInput);
      const parsed = JSON.parse(decrypted);
      if (!parsed?.privateKey || typeof parsed.privateKey !== 'string') {
        throw new Error('Invalid keypair data');
      }

      if (addressRef.current === callerAddress) {
        const kp = parsed as ShieldedKeypair;
        setKeypair(kp);
        return kp;
      }
      return null;
    } catch {
      if (addressRef.current === callerAddress) {
        setError(
          'Failed to unlock — data may be corrupted. Derive a new keypair.',
        );
      }
      return null;
    } finally {
      if (addressRef.current === callerAddress) {
        setIsLoading(false);
      }
    }
  }, [address, signMessageAsync]);

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
