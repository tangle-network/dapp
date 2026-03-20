/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  loadAllCreditKeys,
  saveCreditKeys,
  deleteCreditKeys,
  type StoredCreditKeys,
} from '../utils/payments/indexedDbCreditStorage';
import { keccak256, encodePacked, type Hex } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

interface CreditsContextValue {
  // Credit account keys
  creditAccounts: StoredCreditKeys[];
  generateAndStoreCreditKeys: (label?: string) => Promise<StoredCreditKeys>;
  removeCreditAccount: (commitment: string) => Promise<void>;
  isLoading: boolean;
}

const CreditsContext = createContext<CreditsContextValue | null>(null);

export const CreditsProvider: FC<PropsWithChildren> = ({ children }) => {
  const [creditAccounts, setCreditAccounts] = useState<StoredCreditKeys[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const keys = await loadAllCreditKeys();
        setCreditAccounts(keys);
      } catch {
        setCreditAccounts([]);
      }
      setIsLoading(false);
    };
    load();
  }, []);

  const generateAndStoreCreditKeys = useCallback(
    async (label?: string): Promise<StoredCreditKeys> => {
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
      };

      await saveCreditKeys(keys);
      setCreditAccounts((prev) => [...prev, keys]);
      return keys;
    },
    [],
  );

  const removeCreditAccount = useCallback(async (commitment: string) => {
    await deleteCreditKeys(commitment);
    setCreditAccounts((prev) =>
      prev.filter((k) => k.commitment !== commitment),
    );
  }, []);

  const value = useMemo<CreditsContextValue>(
    () => ({
      creditAccounts,
      generateAndStoreCreditKeys,
      removeCreditAccount,
      isLoading,
    }),
    [
      creditAccounts,
      generateAndStoreCreditKeys,
      removeCreditAccount,
      isLoading,
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
