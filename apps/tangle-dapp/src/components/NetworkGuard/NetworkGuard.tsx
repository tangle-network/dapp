import { FC, ReactNode, useMemo, useCallback } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import {
  Button,
  Card,
  CardVariant,
  Typography,
} from '@tangle-network/ui-components';
import EVMChainId from '@tangle-network/dapp-types/EVMChainId';

// Supported chain IDs for the main dApp features (restaking, liquid staking, dashboard)
const SUPPORTED_CHAIN_IDS = [
  EVMChainId.Base,
  EVMChainId.BaseSepolia,
  EVMChainId.AnvilLocal,
] as const;

const getChainName = (chainId: number): string => {
  switch (chainId) {
    case EVMChainId.EthereumMainNet:
      return 'Ethereum Mainnet';
    case EVMChainId.Holesky:
      return 'Holesky Testnet';
    case EVMChainId.Base:
      return 'Base';
    case EVMChainId.BaseSepolia:
      return 'Base Sepolia';
    case EVMChainId.AnvilLocal:
      return 'Tangle Local';
    case EVMChainId.Arbitrum:
      return 'Arbitrum One';
    case EVMChainId.ArbitrumSepolia:
      return 'Arbitrum Sepolia';
    default:
      return `Chain ${chainId}`;
  }
};

interface NetworkGuardProps {
  children: ReactNode;
}

const NetworkGuard: FC<NetworkGuardProps> = ({ children }) => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  const isWrongNetwork = useMemo(() => {
    if (!isConnected) return false;
    return !SUPPORTED_CHAIN_IDS.includes(
      chainId as (typeof SUPPORTED_CHAIN_IDS)[number],
    );
  }, [isConnected, chainId]);

  const handleSwitchToBase = useCallback(() => {
    switchChain({ chainId: EVMChainId.Base });
  }, [switchChain]);

  const handleSwitchToBaseSepolia = useCallback(() => {
    switchChain({ chainId: EVMChainId.BaseSepolia });
  }, [switchChain]);

  if (!isWrongNetwork) {
    return children;
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] px-4">
      <Card
        variant={CardVariant.GLASS}
        className="p-8 max-w-2xl w-full border border-mono-60 dark:border-mono-160"
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 p-4 bg-red-50/20 dark:bg-red-120/30 rounded-full">
            <svg
              className="w-12 h-12 text-red-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <Typography variant="h4" fw="bold" className="mb-2">
            Wrong Network
          </Typography>

          <Typography
            variant="body1"
            className="text-mono-100 dark:text-mono-100 mb-6 max-w-md"
          >
            This feature requires Base or Base Sepolia network. Please switch to
            a supported network to continue.
          </Typography>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md mb-6">
            <Button
              isFullWidth
              onClick={handleSwitchToBase}
              isLoading={isSwitchingChain}
              isDisabled={isSwitchingChain}
            >
              Base
            </Button>

            <Button
              isFullWidth
              variant="secondary"
              onClick={handleSwitchToBaseSepolia}
              isLoading={isSwitchingChain}
              isDisabled={isSwitchingChain}
            >
              Base Sepolia
            </Button>
          </div>

          <div className="pt-4 border-t border-mono-60 dark:border-mono-160 w-full max-w-md">
            <Typography variant="body2" className="text-mono-100">
              Current network: {getChainName(chainId)}
            </Typography>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NetworkGuard;
