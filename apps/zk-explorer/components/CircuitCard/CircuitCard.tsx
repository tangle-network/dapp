import { Avatar, Card, Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import assert from 'assert';
import { StarIcon } from '@radix-ui/react-icons';
import { CircuitItem } from './types';
import { ShieldKeyholeLineIcon } from '@webb-tools/icons';

export const CircuitCard: FC<CircuitItem> = ({
  filename,
  description,
  constraintCount,
  ownerAvatarUrl,
  stargazerCount,
}) => {
  assert(constraintCount >= 0, 'Constraint count should never be negative.');

  return (
    <Card className="flex flex-row items-center gap-3 space-y-0 py-3 px-6 dark:!bg-transparent dark:bg-glass-dark dark:hover:!bg-mono-180">
      <div>
        <Avatar
          src={ownerAvatarUrl}
          size="lg"
          alt={`${ownerAvatarUrl}'s avatar`}
          className="shadow-md"
        />
      </div>

      <div className="w-full">
        <Typography variant="body1" fw="bold" className="dark:text-mono-0">
          {filename}
        </Typography>

        <Typography
          variant="body2"
          fw="normal"
          className="dark:text-mono-100 mb-1"
          component="p"
        >
          {description}
        </Typography>

        <div className="flex gap-2 items-start">
          <div className="inline-flex items-center">
            <StarIcon className="mr-1 dark:text-mono-100" /> {stargazerCount}
          </div>

          <div className="inline-flex items-center">
            <ShieldKeyholeLineIcon className="mr-1 dark:fill-mono-100" />{' '}
            {constraintCount}
          </div>
        </div>
      </div>
    </Card>
  );
};
