import { Card, Typography } from '@webb-tools/webb-ui-components';
import ExternalLink from '../ExternalLink';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

const PointsReminder: FC<{ className?: string }> = ({ className }) => {
  return (
    <Card
      className={twMerge(
        'bg-purple_gradient dark:bg-purple_gradient_dark backdrop-blur-2xl flex flex-col justify-between',
        className,
      )}
    >
      <Typography variant="h4">Earn Points with Tangle</Typography>

      <div>
        <ul className="list-disc list-inside">
          <li>Deposit restaking assets</li>
          <li>Build dApps</li>
          <li>Develop blueprints</li>
          <li>Deploy instances</li>
          <li>Run a validator/operator</li>
        </ul>
      </div>

      <ExternalLink href="#">Get Started</ExternalLink>
    </Card>
  );
};

export default PointsReminder;
