import { ReactNode, useCallback, type FC } from 'react';
import RestakeTabs from '../../pages/restake/RestakeTabs';
import { RestakeAction, RestakeTab } from '../../constants';
import DepositForm from '../../pages/restake/deposit/DepositForm';
import RestakeWithdrawForm from '../../pages/restake/withdraw';
import RestakeDelegateForm from '../../pages/restake/delegate';
import RestakeUnstakeForm from '../../pages/restake/unstake';
import useRestakeDelegatorInfo from '@tangle-network/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import useRestakeOperatorMap from '@tangle-network/tangle-shared-ui/data/restake/useRestakeOperatorMap';
import useRestakeTvl from '@tangle-network/tangle-shared-ui/data/restake/useRestakeTvl2';
import useRestakeAssets from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssets';
import useRestakeAssetsTvl from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssetsTvl';
import { useRestakeVaults } from '@tangle-network/tangle-shared-ui/data/restake/useRestakeVaults';
import {
  useVaultsTableProps,
  VaultsTable,
} from '../../components/tables/Vaults';
import OperatorsTable from './OperatorsTable';
import BlueprintListing from '../../pages/blueprints/BlueprintListing';
import { useNavigate } from 'react-router';
import { PagePath } from '../../types';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import { RestakeAsset } from '@tangle-network/tangle-shared-ui/types/restake';

type RestakeTabOrAction = RestakeTab | RestakeAction;

type Props = {
  tab: RestakeTabOrAction;
};

const RestakeTabContent: FC<Props> = ({ tab }) => {
  const { result: delegatorInfo } = useRestakeDelegatorInfo();
  const { result: operatorMap } = useRestakeOperatorMap();
  const { operatorConcentration, operatorTvl } = useRestakeTvl(delegatorInfo);
  const navigate = useNavigate();

  const {
    assets,
    isLoading: isLoadingAssets,
    refetchErc20Balances,
  } = useRestakeAssets();

  const handleRestakeClicked = useCallback(() => {
    navigate(PagePath.RESTAKE_DEPOSIT);
  }, [navigate]);

  const getRestakeTabContent = (action: RestakeTabOrAction): ReactNode => {
    switch (action) {
      case RestakeAction.DEPOSIT:
        return (
          <DepositForm
            assets={assets}
            isLoadingAssets={isLoadingAssets}
            refetchErc20Balances={refetchErc20Balances}
          />
        );
      case RestakeAction.WITHDRAW:
        return <RestakeWithdrawForm assets={assets} />;
      case RestakeAction.DELEGATE:
        return <RestakeDelegateForm assets={assets} />;
      case RestakeAction.UNDELEGATE:
        return <RestakeUnstakeForm assets={assets} />;
      case RestakeTab.VAULTS:
        return (
          <VaultTabContent assets={assets} isLoadingAssets={isLoadingAssets} />
        );
      case RestakeTab.OPERATORS:
        return (
          <OperatorsTable
            operatorConcentration={operatorConcentration}
            operatorMap={operatorMap}
            operatorTvl={operatorTvl}
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

export default RestakeTabContent;

type VaultTabContentProps = {
  assets: Map<RestakeAssetId, RestakeAsset> | null;
  isLoadingAssets: boolean;
};

const VaultTabContent = ({ assets, isLoadingAssets }: VaultTabContentProps) => {
  const assetsTvl = useRestakeAssetsTvl();
  const { result: delegatorInfo } = useRestakeDelegatorInfo();

  const vaults = useRestakeVaults({
    assets,
    delegatorInfo,
    assetsTvl,
  });

  const tableProps = useVaultsTableProps({
    delegatorDeposits: delegatorInfo?.deposits,
    assets,
  });

  return (
    <VaultsTable
      data={vaults}
      tableProps={tableProps}
      isLoading={isLoadingAssets}
    />
  );
};
