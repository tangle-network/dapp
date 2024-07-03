import { InformationLine } from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import GlassCard from '../GlassCard';

const VaultListing: FC = () => {
  return (
    <GlassCard>
      {/** TODO: Table here. */}

      <div className="flex flex-col items-start gap-1">
        <InformationLine className="dark:fill-mono-0" />

        <Typography>
          Select the token to unstake to receive &apos;Unstake NFT&apos;
          representing your assets. Redeem after the unbonding period to claim
          funds. <a href="#">(Learn More)</a>
        </Typography>
      </div>
    </GlassCard>
  );
};

export default VaultListing;
