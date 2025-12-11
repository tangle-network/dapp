import { FC, useMemo, useCallback } from 'react';
import {
  Button,
  Card,
  CardVariant,
  Typography,
} from '@tangle-network/ui-components';
import Spinner from '@tangle-network/icons/Spinner';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { mainnet, holesky, foundry } from 'viem/chains';
import {
  CreatePodCard,
  PodOverviewCard,
  CheckpointCard,
  DelegationCard,
  WithdrawalCard,
  ValidatorDashboard,
  VerifyCredentialsCard,
} from '../components';
import { useHasPod, useGetPod } from '../hooks';

// Supported chain IDs for native restaking
const NATIVE_RESTAKING_CHAIN_IDS = [
  mainnet.id,
  holesky.id,
  foundry.id,
] as const;

const getChainName = (chainId: number): string => {
  switch (chainId) {
    case 1:
      return 'Ethereum Mainnet';
    case 17000:
      return 'Holesky Testnet';
    case 8453:
      return 'Base';
    case 84532:
      return 'Base Sepolia';
    case 31337:
      return 'Local (Anvil)';
    case 42161:
      return 'Arbitrum One';
    case 421614:
      return 'Arbitrum Sepolia';
    default:
      return `Chain ${chainId}`;
  }
};

const NativeRestakeContainer: FC = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const { hasPod, isLoading: checkingPod, isDeployed } = useHasPod(address);
  const { podAddress, isLoading: loadingPod } = useGetPod(address);

  const isLoading = checkingPod || loadingPod;

  const isWrongNetwork = useMemo(() => {
    if (!isConnected) return false;
    return !NATIVE_RESTAKING_CHAIN_IDS.includes(
      chainId as (typeof NATIVE_RESTAKING_CHAIN_IDS)[number],
    );
  }, [isConnected, chainId]);

  const handleSwitchToMainnet = useCallback(() => {
    switchChain({ chainId: mainnet.id });
  }, [switchChain]);

  const handleSwitchToHolesky = useCallback(() => {
    switchChain({ chainId: holesky.id });
  }, [switchChain]);

  const handleSwitchToLocal = useCallback(() => {
    switchChain({ chainId: foundry.id });
  }, [switchChain]);

  const content = useMemo(() => {
    if (!isConnected) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Typography variant="h4" fw="bold" className="mb-4">
              Connect Your Wallet
            </Typography>
            <Typography
              variant="body1"
              className="text-mono-120 dark:text-mono-80"
            >
              Connect your wallet to view and manage your native restaking.
            </Typography>
          </div>
        </div>
      );
    }

    if (isWrongNetwork) {
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
                Native restaking requires a supported network. Please switch to
                one of the supported networks to continue.
              </Typography>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg mb-6">
                <Button
                  isFullWidth
                  onClick={handleSwitchToMainnet}
                  isLoading={isSwitchingChain}
                  isDisabled={isSwitchingChain}
                >
                  Mainnet
                </Button>

                <Button
                  isFullWidth
                  variant="secondary"
                  onClick={handleSwitchToHolesky}
                  isLoading={isSwitchingChain}
                  isDisabled={isSwitchingChain}
                >
                  Holesky
                </Button>

                <Button
                  isFullWidth
                  variant="secondary"
                  onClick={handleSwitchToLocal}
                  isLoading={isSwitchingChain}
                  isDisabled={isSwitchingChain}
                >
                  Local
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
    }

    // Show "not deployed" message when contracts aren't available
    if (!isDeployed) {
      return (
        <div className="flex items-center justify-center min-h-[400px] px-4">
          <Card
            variant={CardVariant.GLASS}
            className="p-8 max-w-2xl w-full border border-mono-60 dark:border-mono-160"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 p-4 bg-blue-50/20 dark:bg-blue-120/30 rounded-full">
                <svg
                  className="w-12 h-12 text-blue-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <Typography variant="h4" fw="bold" className="mb-2">
                Coming Soon
              </Typography>

              <Typography
                variant="body1"
                className="text-mono-100 dark:text-mono-100 mb-6 max-w-md"
              >
                Native restaking contracts are not yet deployed on{' '}
                {getChainName(chainId)}. This feature will be available once the
                ValidatorPodManager contract is deployed.
              </Typography>

              <div className="p-4 bg-mono-20 dark:bg-mono-160 rounded-lg w-full max-w-md">
                <Typography variant="body2" className="text-mono-100">
                  Native restaking allows you to restake your Ethereum beacon
                  chain validators on Tangle Network to earn additional rewards
                  while maintaining your validator duties.
                </Typography>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="xl" />
            <Typography
              variant="body1"
              className="text-mono-120 dark:text-mono-80"
            >
              Loading pod data...
            </Typography>
          </div>
        </div>
      );
    }

    if (!hasPod) {
      return (
        <div className="max-w-2xl mx-auto">
          <CreatePodCard />
        </div>
      );
    }

    if (!podAddress || !address) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <Typography
            variant="body1"
            className="text-mono-120 dark:text-mono-80"
          >
            Unable to load pod address.
          </Typography>
        </div>
      );
    }

    // User has a pod - show the full dashboard
    return (
      <div className="space-y-6">
        {/* Pod Overview */}
        <PodOverviewCard podAddress={podAddress} ownerAddress={address} />

        {/* Two column layout for main actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column - Validators and Credentials */}
          <div className="space-y-6">
            <ValidatorDashboard podAddress={podAddress} />
            <VerifyCredentialsCard podAddress={podAddress} />
          </div>

          {/* Right column - Checkpoints and Operations */}
          <div className="space-y-6">
            <CheckpointCard podAddress={podAddress} />
            <DelegationCard ownerAddress={address} />
            <WithdrawalCard ownerAddress={address} />
          </div>
        </div>
      </div>
    );
  }, [
    isConnected,
    isLoading,
    isWrongNetwork,
    isDeployed,
    chainId,
    handleSwitchToMainnet,
    handleSwitchToHolesky,
    handleSwitchToLocal,
    isSwitchingChain,
    hasPod,
    podAddress,
    address,
  ]);

  // Show wrong network, not connected, or not deployed states without the page header
  if (!isConnected || isWrongNetwork || !isDeployed) {
    return <div className="py-6">{content}</div>;
  }

  return (
    <div className="py-6">
      <div className="mb-8">
        <Typography variant="h3" fw="bold">
          Native Restaking
        </Typography>
        <Typography
          variant="body1"
          className="text-mono-120 dark:text-mono-80 mt-2"
        >
          Restake your beacon chain ETH validators on Tangle Network to earn
          additional rewards.
        </Typography>
      </div>

      {content}
    </div>
  );
};

export default NativeRestakeContainer;
