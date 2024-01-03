'use client';

import { Button, Card, Typography } from '@webb-tools/webb-ui-components';
import { WEBB_DOCS_URL } from '@webb-tools/webb-ui-components/constants';
import { FC, useMemo } from 'react';
import { useRequireAuth } from '../hooks/useAuth';
import { formatTimestamp } from '../utils';
import { LargeSquareAvatar } from './LargeSquareAvatar';

export const DashboardOverviewTab: FC = () => {
  const { activatedCircuitCount, createdAt } = useRequireAuth();

  const creationTimestampString = useMemo(
    () => formatTimestamp(createdAt),
    [createdAt]
  );

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6 flex rounded-2xl space-y-0">
        <div className="flex">
          <div className="flex flex-col justify-center gap-1">
            <Typography variant="body2" fw="normal">
              Activated Circuits
            </Typography>

            <Typography variant="h5" fw="bold">
              {activatedCircuitCount === 0 ? '-' : activatedCircuitCount}
            </Typography>
          </div>

          <VerticalDivider />

          <div className="flex flex-col justify-center gap-1">
            <Typography variant="body2" fw="normal">
              Member Since
            </Typography>

            <Typography variant="h5" fw="bold">
              {creationTimestampString}
            </Typography>
          </div>

          <VerticalDivider />

          <div className="flex flex-col justify-center gap-1">
            <Typography variant="body2" fw="normal">
              Links
            </Typography>

            <Typography variant="h5" fw="bold">
              Dec 11, 2023
            </Typography>
          </div>

          <VerticalDivider />

          <div className="flex flex-col justify-center gap-1">
            <Typography variant="body2" fw="normal">
              Short Bio
            </Typography>

            <Typography variant="h5" fw="bold">
              -
            </Typography>
          </div>

          <LargeSquareAvatar />
        </div>
      </Card>

      <Card className="p-6 flex gap-4 rounded-2xl space-y-0">
        <Typography variant="h5" fw="bold">
          Proof Generations
        </Typography>

        <div className="flex flex-col items-center gap-3 py-12 mx-auto">
          <Typography variant="h5" fw="bold" className="text-center">
            🔍
            <br /> Coming Soon!
          </Typography>

          <Typography
            variant="body2"
            fw="normal"
            className="text-center max-w-[712px]"
          >
            Get ready to unlock the full potential of your ZK circuits! Our ZK
            services are on the horizon, designed to seamlessly create and
            manage zero-knowledge proofs with unparalleled efficiency.
          </Typography>

          <Button variant="secondary" href={WEBB_DOCS_URL}>
            Learn More
          </Button>
        </div>
      </Card>
    </div>
  );
};

/** @internal */
const VerticalDivider: FC = () => {
  return (
    <div className="inline-block px-7">
      <div className="border-r dark:border-mono-160 min-h-[57px] h-full" />
    </div>
  );
};
