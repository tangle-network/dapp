import { useQuery } from '@tanstack/react-query';
import { Button } from '@tangle-network/ui-components/components/buttons';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { Cross1Icon } from '@radix-ui/react-icons';
import { useCallback, useMemo, useState } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

const LOCAL_ANVIL_RPC_URL = 'http://127.0.0.1:8545';
const LOCAL_ANVIL_CHAIN_ID = 31337;
const DISMISS_KEY = 'dismiss-local-anvil-banner';

const fetchLocalChainId = async (): Promise<number | null> => {
  try {
    const response = await fetch(LOCAL_ANVIL_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 1,
      }),
    });

    const payload = (await response.json()) as { result?: string };
    const hex = payload.result;
    if (typeof hex !== 'string') return null;
    return Number.parseInt(hex, 16);
  } catch {
    return null;
  }
};

const LocalEnvBanner = () => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending } = useSwitchChain();

  const [dismissed, setDismissed] = useState(() => {
    try {
      return window.localStorage.getItem(DISMISS_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const { data: localChainId } = useQuery({
    queryKey: ['localAnvil', 'chainId'],
    queryFn: fetchLocalChainId,
    refetchInterval: 5_000,
    refetchIntervalInBackground: true,
    staleTime: 5_000,
    retry: 0,
    enabled: import.meta.env.DEV,
  });

  const localAnvilDetected = localChainId === LOCAL_ANVIL_CHAIN_ID;

  const shouldShow = useMemo(() => {
    if (!import.meta.env.DEV) return false;
    if (dismissed) return false;
    if (!isConnected) return false;
    if (!localAnvilDetected) return false;
    return chainId !== LOCAL_ANVIL_CHAIN_ID;
  }, [chainId, dismissed, isConnected, localAnvilDetected]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, 'true');
    } catch {
      // ignore
    }
  }, []);

  if (!shouldShow) return null;

  return (
    <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-mono-40 dark:border-mono-140 bg-mono-0/80 dark:bg-mono-190/40 backdrop-blur-md">
      <div className="flex flex-col gap-1">
        <Typography variant="body2" fw="bold">
          Local Anvil detected (31337)
        </Typography>
        <Typography variant="body3" className="text-mono-120 dark:text-mono-80">
          You funded local Anvil via <code>anvil_setBalance</code> and ERC20
          transfers. Switch your wallet network to Anvil Local to see the funded
          balances in the UI.
        </Typography>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          isDisabled={!switchChainAsync || isPending}
          isLoading={isPending}
          onClick={async () => {
            if (!switchChainAsync) return;
            await switchChainAsync({ chainId: LOCAL_ANVIL_CHAIN_ID });
          }}
        >
          Switch
        </Button>

        <button
          type="button"
          onClick={handleDismiss}
          className="p-2 rounded-lg hover:bg-mono-20 dark:hover:bg-mono-180"
          aria-label="Dismiss local env notice"
        >
          <Cross1Icon />
        </button>
      </div>
    </div>
  );
};

export default LocalEnvBanner;

