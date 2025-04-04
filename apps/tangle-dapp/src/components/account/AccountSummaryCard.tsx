import { FC } from 'react';
import CardWithTangleLogo from '../CardWithTangleLogo';
import AccountAddress from './AccountAddress';
import Actions from './Actions';
import Balance from './Balance';

const AccountSummaryCard: FC<{ className?: string }> = ({ className }) => {
  return (
    <CardWithTangleLogo className={className}>
      <div className="w-full space-y-5">
        <header>
          <AccountAddress />
        </header>

        <Balance />

        <Actions />
      </div>
    </CardWithTangleLogo>
  );
};

export default AccountSummaryCard;
