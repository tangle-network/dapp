/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAccount } from 'wagmi';
import {
  loadCreditKeysForAddress,
  saveCreditKeys,
  deleteCreditKeys,
  type StoredCreditKeys,
} from '../utils/payments/indexedDbCreditStorage';
import { keccak256, encodePacked, type Hex } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { useShieldedContext } from './ShieldedProvider';

interface CreditsContextValue {
  creditAccounts: StoredCreditKeys[];
  generateAndStoreCreditKeys: (label?: string) => Promise<StoredCreditKeys>;
  removeCreditAccount: (commitment: string) => Promise<void>;
  isLoading: boolean;
  /** True when keypair is unlocked and credit keys are decryptable */
  isUnlocked: boolean;
}

const CreditsContext = createContext<CreditsContextValue | null>(null);

export const CreditsProvider: FC<PropsWithChildren> = ({ children }) => {
  const { address } = useAccount();
  const { keypair } = useShieldedContext();
  const [creditAccounts, setCreditAccounts] = useState<StoredCreditKeys[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generation counter to detect stale async loads
  const genRef = useRef(0);

  const encryptionKey = keypair
    ? keccak256(
        encodePacked(['string'], [keypair.privateKey + ':credit-encryption']),
      )
    : undefined;

  useEffect(() => {
    const gen = ++genRef.current;
    queueMicrotask(() => {
      if (genRef.current === gen) {
        setCreditAccounts([]);
        setIsLoading(Boolean(address));
      }
    });

    if (!address) {
      return;
    }

    const load = async () => {
      try {
        const keys = await loadCreditKeysForAddress(address, encryptionKey);
        if (genRef.current === gen) {
          setCreditAccounts(keys);
        }
      } catch {
        if (genRef.current === gen) {
          setCreditAccounts([]);
        }
      }
      if (genRef.current === gen) {
        setIsLoading(false);
      }
    };
    load();
  }, [address, encryptionKey]);

  const generateAndStoreCreditKeys = useCallback(
    async (label?: string): Promise<StoredCreditKeys> => {
      if (!address) throw new Error('Wallet not connected');
      if (!encryptionKey) {
        throw new Error(
          'Unlock your shielded keypair before generating credit keys',
        );
      }

      const privateKey = generatePrivateKey();
      const account = privateKeyToAccount(privateKey);
      const saltBytes = crypto.getRandomValues(new Uint8Array(32));
      const salt = ('0x' +
        Array.from(saltBytes)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')) as Hex;
      const commitment = keccak256(
        encodePacked(['address', 'bytes32'], [account.address, salt]),
      );

      const keys: StoredCreditKeys = {
        commitment,
        spendingPrivateKey: privateKey,
        spendingPublicKey: account.address,
        salt,
        label,
        createdAt: Date.now(),
        isLocked: false,
      };

      await saveCreditKeys(keys, address, encryptionKey);
      setCreditAccounts((prev) => [...prev, keys]);
      return keys;
    },
    [address, encryptionKey],
  );

  const removeCreditAccount = useCallback(
    async (commitment: string) => {
      if (!address) return;
      await deleteCreditKeys(commitment, address);
      setCreditAccounts((prev) =>
        prev.filter((k) => k.commitment !== commitment),
      );
    },
    [address],
  );

  const value = useMemo<CreditsContextValue>(
    () => ({
      creditAccounts,
      generateAndStoreCreditKeys,
      removeCreditAccount,
      isLoading,
      isUnlocked: !!encryptionKey,
    }),
    [
      creditAccounts,
      generateAndStoreCreditKeys,
      removeCreditAccount,
      isLoading,
      encryptionKey,
    ],
  );

  return (
    <CreditsContext.Provider value={value}>{children}</CreditsContext.Provider>
  );
};

export const useCreditsContext = (): CreditsContextValue => {
  const ctx = useContext(CreditsContext);
  if (!ctx) {
    throw new Error('useCreditsContext must be used within CreditsProvider');
  }
  return ctx;
};
