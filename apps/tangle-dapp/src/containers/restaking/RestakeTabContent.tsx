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
  useRestakeContext,
} from '@tangle-network/tangle-shared-ui/context/RestakeContext';

type RestakeTabOrAction = RestakeTab | RestakeAction;

type Props = {
  tab: RestakeTabOrAction;
};

const RestakeTabContentInner: FC<Props> = ({ tab }) => {
  const navigate = useNavigate();

  // Use unified context for all restaking data
  const {
    restakingAssets,
    delegator,
    operatorMap,
    isLoadingRestakingAssets,
    isLoadingDelegator,
    isLoadingOperators,
  } = useRestakeContext();

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
