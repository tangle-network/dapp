import { FC } from 'react';
import CardWithTangleLogo from '../CardWithTangleLogo';
import AccountAddress from './AccountAddress';
import Balance from './Balance';
import AccountPoints from './AccountPoints';

const AccountSummaryCard: FC<{ className?: string }> = ({ className }) => {
  return (
    <CardWithTangleLogo className={className}>
      <div className="w-full space-y-5">
        <header>
          <AccountAddress />
        </header>

        <Balance />

        <AccountPoints />
      </div>
    </CardWithTangleLogo>
  );
};

export default AccountSummaryCard;
