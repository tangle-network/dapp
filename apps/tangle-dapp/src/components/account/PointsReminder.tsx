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
        <Typography variant="h5">[Insert Campaign] Phase 0</Typography>

        <Typography variant="body1">Description of the campaign.</Typography>
      </div>

      <ExternalLink href="#">Get Started</ExternalLink>
    </Card>
  );
};

export default PointsReminder;
