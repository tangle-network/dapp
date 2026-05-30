import { EvmWalletModal } from '@tangle-network/tangle-shared-ui/components/EvmWalletModal';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * App-level owner of a single wallet-connect modal that can be opened
 * imperatively — specifically so the iframe bridge can honour a
 * `tangle.app.requestConnect` from an embedded blueprint (the iframe is
 * sandboxed and can't reach a wallet itself; it delegates to the parent).
 *
 * This is the same `EvmWalletModal` the nav's ConnectWalletButton uses; here
 * it's mounted once at the app root and driven by context so any consumer —
 * including the bridge hook, which lives in a different subtree — can open it.
 */
type WalletConnectModalCtx = {
  /** Open the wallet-connect modal. */
  open: () => void;
  /** Whether the modal is currently open (lets the bridge detect dismissal). */
  isOpen: boolean;
};

const Context = createContext<WalletConnectModalCtx | null>(null);

export function WalletConnectModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const value = useMemo<WalletConnectModalCtx>(
    () => ({ open, isOpen }),
    [open, isOpen],
  );

  return (
    <Context.Provider value={value}>
      {children}
      <EvmWalletModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </Context.Provider>
  );
}

/** Imperative wallet-connect modal control. Safe no-op outside the provider. */
// eslint-disable-next-line react-refresh/only-export-components
export function useWalletConnectModal(): WalletConnectModalCtx {
  return useContext(Context) ?? { open: () => undefined, isOpen: false };
}
