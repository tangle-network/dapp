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
import Spinner from '@tangle-network/icons/Spinner';

type RestakeTabOrAction = RestakeTab | RestakeAction;

type Props = {
  tab: RestakeTabOrAction;
};

const LoadingSpinner: FC = () => (
  <div className="flex items-center justify-center py-16">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="xl" />
      <Typography variant="body1" className="text-mono-120 dark:text-mono-80">
        Loading restaking data...
      </Typography>
    </div>
  </div>
);

const RestakeTabContentInner: FC<Props> = ({ tab }) => {
  const navigate = useNavigate();

  // Use optional context to handle HMR edge cases
  const context = useOptionalRestakeContext();

  // Must call useCallback before any conditional returns (React hooks rules)
  const handleRestakeClicked = useCallback(() => {
    navigate(PagePath.RESTAKE_DEPOSIT);
  }, [navigate]);

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
