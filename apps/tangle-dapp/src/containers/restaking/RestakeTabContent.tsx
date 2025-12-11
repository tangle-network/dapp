import { ReactNode, useCallback, type FC } from 'react';
import RestakeTabs from '../../pages/restake/RestakeTabs';
import { RestakeAction, RestakeTab } from '../../constants';
import DepositForm from '../../pages/restake/deposit/DepositForm';
import RestakeWithdrawForm from '../../pages/restake/withdraw';
import RestakeDelegateForm from '../../pages/restake/delegate';
import RestakeUnstakeForm from '../../pages/restake/unstake';
import BlueprintListing from '../../pages/blueprints/BlueprintListing';
import { useNavigate } from 'react-router';
import { PagePath } from '../../types';
import { NetworkGuard } from '../../components/NetworkGuard';
import { RestakingAssetsTable } from '../../components/tables/RestakingAssetsTable';
import { OperatorsTable } from '../../components/tables/OperatorsTable';
import {
  RestakeProvider,
  useOptionalRestakeContext,
} from '@tangle-network/tangle-shared-ui/context/RestakeContext';
import { Typography } from '@tangle-network/ui-components';

type RestakeTabOrAction = RestakeTab | RestakeAction;

type Props = {
  tab: RestakeTabOrAction;
};

const LoadingSpinner: FC = () => (
  <div className="flex items-center justify-center py-16">
    <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/20">
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-purple-500/20" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
        </div>
        <div className="text-center">
          <Typography variant="body1" fw="semibold" className="text-mono-0">
            Loading Assets
          </Typography>
          <Typography variant="body2" className="text-mono-100 mt-1">
            Fetching restaking data...
          </Typography>
        </div>
      </div>
    </div>
  </div>
);

const RestakeTabContentInner: FC<Props> = ({ tab }) => {
  const navigate = useNavigate();

  // Use optional context to handle HMR edge cases
  const context = useOptionalRestakeContext();

  // If context is not available (e.g., during HMR), show loading state
  if (!context) {
    return (
      <div className="space-y-9">
        <RestakeTabs />
        <LoadingSpinner />
      </div>
    );
  }

  const {
    restakingAssets,
    delegator,
    operatorMap,
    isLoadingRestakingAssets,
    isLoadingDelegator,
    isLoadingOperators,
  } = context;

  const handleRestakeClicked = useCallback(() => {
    navigate(PagePath.RESTAKE_DEPOSIT);
  }, [navigate]);

  const getRestakeTabContent = (action: RestakeTabOrAction): ReactNode => {
    switch (action) {
      case RestakeAction.DEPOSIT:
        return <DepositForm />;
      case RestakeAction.WITHDRAW:
        return <RestakeWithdrawForm />;
      case RestakeAction.DELEGATE:
        return <RestakeDelegateForm />;
      case RestakeAction.UNDELEGATE:
        return <RestakeUnstakeForm />;
      case RestakeTab.VAULTS:
        return (
          <RestakingAssetsTable
            assets={restakingAssets ?? []}
            delegator={delegator}
            isLoading={isLoadingRestakingAssets || isLoadingDelegator}
          />
        );
      case RestakeTab.OPERATORS:
        return (
          <OperatorsTable
            operatorMap={operatorMap}
            isLoading={isLoadingOperators}
            onRestakeClicked={handleRestakeClicked}
          />
        );
      case RestakeTab.BLUEPRINTS:
        return <BlueprintListing />;
    }
  };

  return (
    <div className="space-y-9">
      <RestakeTabs />
      {getRestakeTabContent(tab)}
    </div>
  );
};

const RestakeTabContent: FC<Props> = ({ tab }) => {
  return (
    <NetworkGuard>
      <RestakeProvider>
        <RestakeTabContentInner tab={tab} />
      </RestakeProvider>
    </NetworkGuard>
  );
};

export default RestakeTabContent;
