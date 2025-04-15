import { ReactNode, useCallback, type FC } from 'react';
import RestakeTabs from '../../pages/restake/RestakeTabs';
import { RestakeAction, RestakeTab } from '../../constants';
import DepositForm from '../../pages/restake/deposit/DepositForm';
import RestakeWithdrawForm from '../../pages/restake/withdraw';
import RestakeDelegateForm from '../../pages/restake/delegate';
import RestakeUnstakeForm from '../../pages/restake/unstake';
import useRestakeDelegatorInfo from '@tangle-network/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import useRestakeOperatorMap from '@tangle-network/tangle-shared-ui/data/restake/useRestakeOperatorMap';
import useRestakeTVL from '@tangle-network/tangle-shared-ui/data/restake/useRestakeTVL';
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

type RestakeTabOrAction = RestakeTab | RestakeAction;

type Props = {
  tab: RestakeTabOrAction;
};

const RestakeTabContent: FC<Props> = ({ tab }) => {
  const { result: delegatorInfo } = useRestakeDelegatorInfo();
  const { operatorMap } = useRestakeOperatorMap();
  const { operatorConcentration, operatorTVL } = useRestakeTVL(
    operatorMap,
    delegatorInfo,
  );
  const navigate = useNavigate();

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
        return <VaultTabContent />;
      case RestakeTab.OPERATORS:
        return (
          <OperatorsTable
            operatorConcentration={operatorConcentration}
            operatorMap={operatorMap}
            operatorTVL={operatorTVL}
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

const VaultTabContent = () => {
  const { assets, isLoading: isLoadingAssets } = useRestakeAssets();
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
