import { ReactNode, useCallback, type FC } from 'react';
import StakingTabs from '../../pages/staking/StakingTabs';
import { StakingAction, StakingTab } from '../../constants';
import DepositForm from '../../pages/staking/deposit/DepositForm';
import StakingWithdrawForm from '../../pages/staking/withdraw';
import StakingDelegateForm from '../../pages/staking/delegate';
import StakingUndelegateForm from '../../pages/staking/undelegate';
import BlueprintListing from '../../pages/blueprints/BlueprintListing';
import { ClaimableRewardsCard } from '../../components/staking';
import { useNavigate } from 'react-router';
import { PagePath, QueryParamKey } from '../../types';
import type { Address } from 'viem';
import { NetworkGuard } from '../../components/NetworkGuard';
import { StakingAssetsTable } from '../../components/tables/StakingAssetsTable';
import { OperatorsTable } from '../../components/tables/OperatorsTable';
import {
  StakingProvider,
  useOptionalStakingContext,
} from '@tangle-network/tangle-shared-ui/context/StakingContext';
import { Typography } from '@tangle-network/ui-components';
import Spinner from '@tangle-network/icons/Spinner';
import { useAccount } from 'wagmi';

type StakingTabOrAction = StakingTab | StakingAction;

type Props = {
  tab: StakingTabOrAction;
};

const LoadingSpinner: FC = () => (
  <div className="flex items-center justify-center py-16">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="xl" />
      <Typography variant="body1" className="text-mono-120 dark:text-mono-80">
        Loading staking data...
      </Typography>
    </div>
  </div>
);

const RewardsTabContent: FC = () => {
  const { address } = useAccount();

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Typography variant="h5" className="text-mono-120 dark:text-mono-80">
          Connect your wallet to view rewards
        </Typography>

        <Typography
          variant="body2"
          className="text-mono-100 dark:text-mono-100"
        >
          You need to connect a wallet to see your claimable rewards and
          projections.
        </Typography>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <ClaimableRewardsCard />
    </div>
  );
};

const StakingTabContentInner: FC<Props> = ({ tab }) => {
  const navigate = useNavigate();

  // Use optional context to handle HMR edge cases
  const context = useOptionalStakingContext();

  // Must call useCallback before any conditional returns (React hooks rules)
  const handleDelegateClicked = useCallback(
    (operatorAddress: Address) => {
      navigate(
        `${PagePath.STAKING_DELEGATE}?${QueryParamKey.STAKING_OPERATOR}=${operatorAddress}`,
      );
    },
    [navigate],
  );

  // If context is not available (e.g., during HMR), show loading state
  if (!context) {
    return (
      <div className="space-y-9">
        <StakingTabs />
        <LoadingSpinner />
      </div>
    );
  }

  const {
    stakingAssets,
    assetList,
    delegator,
    operatorMap,
    isLoadingStakingAssets,
    isLoadingAssets,
    isLoadingDelegator,
    isLoadingOperators,
  } = context;

  const getStakingTabContent = (action: StakingTabOrAction): ReactNode => {
    switch (action) {
      case StakingAction.DEPOSIT:
        return <DepositForm />;
      case StakingAction.WITHDRAW:
        return <StakingWithdrawForm />;
      case StakingAction.DELEGATE:
        return <StakingDelegateForm />;
      case StakingAction.UNDELEGATE:
        return <StakingUndelegateForm />;
      case StakingTab.VAULTS:
        return (
          <StakingAssetsTable
            assets={assetList}
            stakingAssets={stakingAssets ?? []}
            delegator={delegator}
            isLoading={
              isLoadingStakingAssets || isLoadingAssets || isLoadingDelegator
            }
          />
        );
      case StakingTab.OPERATORS:
        return (
          <OperatorsTable
            operatorMap={operatorMap}
            isLoading={isLoadingOperators}
            onDelegateClicked={handleDelegateClicked}
          />
        );
      case StakingTab.BLUEPRINTS:
        return <BlueprintListing />;
      case StakingTab.REWARDS:
        return <RewardsTabContent />;
    }
  };

  // Check if this is an action tab (needs centered layout)
  const isActionTab = Object.values(StakingAction).includes(
    tab as StakingAction,
  );

  return (
    <div className="space-y-9">
      <StakingTabs />
      {isActionTab ? (
        <div className="flex justify-center max-w-5xl mx-auto">
          {getStakingTabContent(tab)}
        </div>
      ) : (
        getStakingTabContent(tab)
      )}
    </div>
  );
};

const StakingTabContent: FC<Props> = ({ tab }) => {
  return (
    <NetworkGuard>
      <StakingProvider>
        <StakingTabContentInner tab={tab} />
      </StakingProvider>
    </NetworkGuard>
  );
};

export default StakingTabContent;
