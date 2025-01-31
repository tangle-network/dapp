import { Card, Typography } from '@webb-tools/webb-ui-components';
import ExternalLink from '../ExternalLink';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

const PointsReminder: FC<{ className?: string }> = ({ className }) => {
  return (
    <Card
      className={twMerge(
        'bg-purple_gradient dark:bg-purple_gradient_dark backdrop-blur-2xl flex flex-col gap-2',
        className,
      )}
    >
      <Typography variant="h4">Earn Points with Tangle</Typography>

      <Typography variant="body1">
        Participate in the campaign by completing the following tasks to earn
        points which can be redeemed for rewards later on.
      </Typography>

      <div>
        <ul className="list-disc list-inside">
          <li>Deposit & delegate restaking assets</li>
          <li>Build dApps</li>
          <li>Develop blueprints</li>
          <li>Deploy instances</li>
          <li>Run a validator/operator</li>
        </ul>
      </div>

      <div className="mt-auto">
        <ExternalLink href="https://docs.tangle.tools/network/participation-mechanics">
          Learn More
        </ExternalLink>
      </div>
    </Card>
  );
};

export default PointsReminder;
