import { Button, Typography } from '@webb-tools/webb-ui-components';
import Link from 'next/link';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import GlassCard from '../../components/GlassCard/GlassCard';
import TangleBigLogo from '../../components/TangleBigLogo';
import { PagePath } from '../../types';

interface WhatIsRestakingCardProps {
  className?: string;
}

const WhatIsRestakingCard: FC<WhatIsRestakingCardProps> = ({ className }) => {
  return (
    <GlassCard
      className={twMerge(
        'flex flex-col justify-between min-h-[300px] relative',
        className,
      )}
    >
      <div className="flex-1 space-y-5">
        <Typography variant="h5" fw="bold">
          What Is Restaking?
        </Typography>

        <Typography variant="body2">
          Restaking empowers Tangle’s validators to actively participate in the
          network by allocating a portion of their staked tokens to various
          multi-party computation (MPC) service roles.
        </Typography>
      </div>
      <div className="flex flex-row flex-wrap items-end justify-end gap-2 md:items-center">
        <Button as={Link} href={PagePath.RESTAKE}>
          Restake Now
        </Button>

        {/* TODO: update this after the restaking page on docs available */}
        {/* <Button variant="secondary">
          Learn More
        </Button> */}
      </div>

      <TangleBigLogo className="w-48 absolute top-[50%] translate-y-[-50%] right-0" />
    </GlassCard>
  );
};

export default WhatIsRestakingCard;
