/**
 * Combined user restaking overview with Total Restaked and Claimable Rewards cards.
 * Displays side-by-side on larger screens, stacked on mobile.
 */

import { FC } from 'react';
import { useAccount } from 'wagmi';
import { Typography } from '@tangle-network/ui-components';
import TotalRestakedCard from './TotalRestakedCard';
import ClaimableRewardsCard from './ClaimableRewardsCard';

const UserRestakingOverview: FC = () => {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <Typography
          variant="body1"
          className="text-mono-100 dark:text-mono-100"
        >
          Connect your wallet to view your restaking position
        </Typography>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TotalRestakedCard />
      <ClaimableRewardsCard />
    </div>
  );
};

export default UserRestakingOverview;
