import { FC } from 'react';
import CardWithTangleLogo from '../CardWithTangleLogo';
import AccountAddress from './AccountAddress';
import Balance from './Balance';
import AccountRewards from './AccountRewards';
import AccountPoints from './AccountPoints';

const AccountSummaryCard: FC<{ className?: string }> = ({ className }) => {
  return (
    <CardWithTangleLogo className={className}>
      <div className="w-full space-y-5">
        <header>
          <AccountAddress />
        </header>

        <Balance />

        <div className="grid grid-cols-2 gap-6">
          <AccountRewards />

          <AccountPoints />
        </div>
      </div>
    </CardWithTangleLogo>
  );
};

export default AccountSummaryCard;
