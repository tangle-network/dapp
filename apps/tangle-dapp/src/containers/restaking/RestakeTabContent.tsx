import { ReactNode, useCallback, type FC } from 'react';
import RestakeTabs from '../../pages/restake/RestakeTabs';
import { RestakeAction, RestakeTab } from '../../constants';
import DepositForm from '../../pages/restake/deposit/DepositForm';
import RestakeWithdrawForm from '../../pages/restake/withdraw';
import RestakeDelegateForm from '../../pages/restake/delegate';
import RestakeUnstakeForm from '../../pages/restake/unstake';
import {
  useOperatorMap,
  useRestakingAssets,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { useDelegator } from '@tangle-network/tangle-shared-ui/data/graphql/useDelegator';
import BlueprintListing from '../../pages/blueprints/BlueprintListing';
import { useNavigate } from 'react-router';
import { useAccount } from 'wagmi';
import { PagePath } from '../../types';
import { NetworkGuard } from '../../components/NetworkGuard';
import { RestakingAssetsTable } from '../../components/tables/RestakingAssetsTable';
import { OperatorsTable } from '../../components/tables/OperatorsTable';

type RestakeTabOrAction = RestakeTab | RestakeAction;

type Props = {
  tab: RestakeTabOrAction;
};

const RestakeTabContent: FC<Props> = ({ tab }) => {
  const { address } = useAccount();
  const navigate = useNavigate();

  // Fetch delegator info from GraphQL
  const { data: delegatorInfo, isLoading: isLoadingDelegator } =
    useDelegator(address);

  // Fetch operators from GraphQL
  const { data: operatorMap, isLoading: isLoadingOperators } = useOperatorMap({
    status: 'ACTIVE',
  });

  // Fetch restaking assets from GraphQL
  const { data: restakingAssets, isLoading: isLoadingAssets } =
    useRestakingAssets();

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
            delegator={delegatorInfo ?? null}
            isLoading={isLoadingAssets || isLoadingDelegator}
          />
        );
      case RestakeTab.OPERATORS:
        return (
          <OperatorsTable
            operatorMap={operatorMap ?? null}
            isLoading={isLoadingOperators}
            onRestakeClicked={handleRestakeClicked}
          />
        );
      case RestakeTab.BLUEPRINTS:
        return <BlueprintListing />;
    }
  };

  return (
    <NetworkGuard>
      <div className="space-y-9">
        <RestakeTabs />
        {getRestakeTabContent(tab)}
      </div>
    </NetworkGuard>
  );
};

export default RestakeTabContent;
