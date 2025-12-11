import { ReactNode, type FC } from 'react';
import LiquidStakingTabs from '../../pages/liquid-staking/LiquidStakingTabs';
import { LiquidStakingAction, LiquidStakingTab } from '../../constants';
import LiquidStakingDepositForm from '../../pages/liquid-staking/deposit';
import LiquidStakingRedeemForm from '../../pages/liquid-staking/redeem';
import CreateVaultForm from '../../pages/liquid-staking/create-vault';
import LiquidDelegationVaultsTable from '../../components/LiquidStaking/VaultsTable';
import UserPositionsTable from '../../components/LiquidStaking/UserPositionsTable';
import { NetworkGuard } from '../../components/NetworkGuard';

type LiquidStakingTabOrAction = LiquidStakingTab | LiquidStakingAction;

type Props = {
  tab: LiquidStakingTabOrAction;
};

const LiquidStakingTabContent: FC<Props> = ({ tab }) => {
  const getTabContent = (action: LiquidStakingTabOrAction): ReactNode => {
    switch (action) {
      case LiquidStakingAction.DEPOSIT:
        return <LiquidStakingDepositForm />;
      case LiquidStakingAction.REDEEM:
        return <LiquidStakingRedeemForm />;
      case LiquidStakingAction.CREATE_VAULT:
        return <CreateVaultForm />;
      case LiquidStakingTab.VAULTS:
        return <LiquidDelegationVaultsTable />;
      case LiquidStakingTab.POSITIONS:
        return <UserPositionsTable />;
      default:
        return <LiquidStakingDepositForm />;
    }
  };

  return (
    <NetworkGuard>
      <div className="space-y-9">
        <LiquidStakingTabs />
        {getTabContent(tab)}
      </div>
    </NetworkGuard>
  );
};

export default LiquidStakingTabContent;
