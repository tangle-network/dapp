import { Loadable, Page } from './types';

type PublicKeyContent = {
  id: string;

  uncompressed: string;
  compressed: string;

  start: Date;
  end: Date;
  session: string;
};
interface PublicKey extends PublicKeyContent {
  isCurrent: boolean;
  keyGenAuthorities: string[];
}

interface PublicKeyListView extends PublicKeyContent {
  height: string;
  keyGenAuthorities: string[];
  keyGenThreshold: string;
  signatureThreshold: string;
  session: string;
}
type PublicKeyHistoryEntry = {
  at: Date;
  hash: string;
  status: 'Generated' | 'Signed' | 'Rotated';
};

interface PublicKeyDetails extends PublicKeyContent {
  isCurrent: string;
  history: PublicKeyHistoryEntry[];
}

export function useKeys(): Loadable<Page<PublicKeyListView>> {}

export function useActiveKeys(): Loadable<[PublicKey, PublicKey]> {}

export function useKey(id: string): Loadable<PublicKeyDetails> {}
