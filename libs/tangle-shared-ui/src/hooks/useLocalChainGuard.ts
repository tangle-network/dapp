import { useEffect, useRef } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

const DEFAULT_LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1']);

type UseLocalChainGuardOptions = {
  enabled?: boolean;
  targetChainId: number;
};

/**
 * Enforce a target chain for local dev sessions to avoid chain drift
 * when wallets reconnect to previously-used networks (e.g. mainnet).
 */
const useLocalChainGuard = ({
  enabled = true,
  targetChainId,
}: UseLocalChainGuardOptions) => {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const lastAttemptedChainIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !isConnected || !switchChainAsync) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    if (!DEFAULT_LOCAL_HOSTNAMES.has(window.location.hostname)) {
      return;
    }

    if (chainId === targetChainId) {
      lastAttemptedChainIdRef.current = null;
      return;
    }

    if (lastAttemptedChainIdRef.current === chainId) {
      return;
    }

    lastAttemptedChainIdRef.current = chainId;

    void switchChainAsync({ chainId: targetChainId }).catch((error) => {
      console.warn('[useLocalChainGuard] Failed to switch local chain', {
        currentChainId: chainId,
        targetChainId,
        error,
      });
    });
  }, [chainId, enabled, isConnected, switchChainAsync, targetChainId]);
};

export default useLocalChainGuard;
