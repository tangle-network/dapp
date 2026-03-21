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
import { IndexedDbNoteStorage } from '../utils/payments/indexedDbNoteStorage';
import useKeypair, { type ShieldedKeypair } from '../hooks/payments/useKeypair';
import type { NoteData } from '../types/shielded';

interface ShieldedContextValue {
  keypair: ShieldedKeypair | null;
  deriveKeypair: () => Promise<ShieldedKeypair | null>;
  unlockKeypair: () => Promise<ShieldedKeypair | null>;
  clearKeypair: () => void;
  hasDerivedKeypair: boolean;
  hasStoredKeypair: boolean;
  isDerivingKeypair: boolean;
  notes: NoteData[];
  addNote: (note: NoteData) => Promise<void>;
  removeNote: (note: NoteData) => Promise<void>;
  importNotes: (serialized: string[]) => Promise<void>;
  exportNotes: () => string[];
  shieldedBalance: bigint;
  isReady: boolean;
}

const ShieldedContext = createContext<ShieldedContextValue | null>(null);

const serializeNote = (note: NoteData): string =>
  JSON.stringify({ ...note, amount: note.amount.toString() });

const deserializeNote = (raw: string): NoteData => {
  const parsed = JSON.parse(raw);
  return { ...parsed, amount: BigInt(parsed.amount) };
};

const noteKey = (n: NoteData) =>
  `${n.privateKey}:${n.blinding}:${n.targetAnchor}`;

export const ShieldedProvider: FC<PropsWithChildren> = ({ children }) => {
  const { address } = useAccount();
  const {
    keypair,
    deriveKeypair,
    unlockKeypair,
    clearKeypair,
    isLoading: isDerivingKeypair,
    hasDerivedKeypair,
    hasStoredKeypair,
  } = useKeypair();

  const [notes, setNotes] = useState<NoteData[]>([]);
  const [isReady, setIsReady] = useState(false);
  const storageRef = useRef<IndexedDbNoteStorage | null>(null);
  const notesRef = useRef(notes);
  notesRef.current = notes;
  // Sequential write queue to prevent concurrent persist() from losing notes
  const writeQueueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    // Reset synchronously to prevent stale data flash
    setNotes([]);
    setIsReady(false);
    // Flush the write queue so no pending writes leak to the new address
    writeQueueRef.current = Promise.resolve();

    storageRef.current = new IndexedDbNoteStorage(address);
    const storage = storageRef.current;

    const load = async () => {
      try {
        const raw = await storage.load();
        // Guard: address changed during async load
        if (storageRef.current === storage) {
          setNotes(raw.map(deserializeNote));
        }
      } catch {
        if (storageRef.current === storage) {
          setNotes([]);
        }
      }
      if (storageRef.current === storage) {
        setIsReady(true);
      }
    };
    load();
  }, [address]);

  const persist = useCallback(
    (mutateFn: (current: NoteData[]) => NoteData[]) => {
      writeQueueRef.current = writeQueueRef.current.then(async () => {
        const updated = mutateFn(notesRef.current);
        if (storageRef.current) {
          await storageRef.current.save(updated.map(serializeNote));
        }
        setNotes(updated);
      });
      return writeQueueRef.current;
    },
    [],
  );

  const addNote = useCallback(
    (note: NoteData) => persist((current) => [...current, note]),
    [persist],
  );

  const removeNote = useCallback(
    (note: NoteData) => {
      const key = noteKey(note);
      return persist((current) => current.filter((n) => noteKey(n) !== key));
    },
    [persist],
  );

  const importNotes = useCallback(
    (serialized: string[]) =>
      persist((current) => {
        const imported = serialized.map(deserializeNote);
        const existing = new Set(current.map(noteKey));
        return [
          ...current,
          ...imported.filter((n) => !existing.has(noteKey(n))),
        ];
      }),
    [persist],
  );

  const exportNotes = useCallback(
    () => notesRef.current.map(serializeNote),
    [],
  );

  const shieldedBalance = useMemo(
    () => notes.reduce((sum, n) => sum + n.amount, 0n),
    [notes],
  );

  const value = useMemo<ShieldedContextValue>(
    () => ({
      keypair,
      deriveKeypair,
      unlockKeypair,
      clearKeypair,
      hasDerivedKeypair,
      hasStoredKeypair,
      isDerivingKeypair,
      notes,
      addNote,
      removeNote,
      importNotes,
      exportNotes,
      shieldedBalance,
      isReady,
    }),
    [
      keypair,
      deriveKeypair,
      unlockKeypair,
      clearKeypair,
      hasDerivedKeypair,
      hasStoredKeypair,
      isDerivingKeypair,
      notes,
      addNote,
      removeNote,
      importNotes,
      exportNotes,
      shieldedBalance,
      isReady,
    ],
  );

  return (
    <ShieldedContext.Provider value={value}>
      {children}
    </ShieldedContext.Provider>
  );
};

export const useShieldedContext = (): ShieldedContextValue => {
  const ctx = useContext(ShieldedContext);
  if (!ctx) {
    throw new Error('useShieldedContext must be used within ShieldedProvider');
  }
  return ctx;
};
