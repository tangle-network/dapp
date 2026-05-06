import { FC } from 'react';
import CardWithTangleLogo from '../CardWithTangleLogo';
import AccountAddress from './AccountAddress';
import Actions from './Actions';
import Balance from './Balance';
import { ClaimCreditsButton } from '../../features/claimCredits';

const AccountSummaryCard: FC<{ className?: string }> = ({ className }) => {
  return (
    <CardWithTangleLogo className={className}>
      <div className="w-full flex flex-col gap-4">
        <header className="flex lg:flex-col xl:flex-row justify-between items-start lg:min-h-[80px] xl:min-h-0">
          <AccountAddress />
          <ClaimCreditsButton />
        </header>

        <Balance />

        <Actions />
      </div>
    </CardWithTangleLogo>
  );
};

export default AccountSummaryCard;
