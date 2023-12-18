import { Card, Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import Image from 'next/image';
import assert from 'assert';
import { LockOpen1Icon, StarIcon } from '@radix-ui/react-icons';
import { CircuitItem } from './types';

export const CircuitCard: FC<CircuitItem> = (props) => {
  assert(props.locks >= 0, 'Lock count should never be negative.');

  return (
    <Card className="flex flex-row items-center gap-3 space-y-0 py-3 px-6">
      <div>
        {/* TODO: Likely there's a way to get Tailwind-dependent width & height values for the Image component. */}
        <Image
          alt={`${props.ownerAvatarUrl}'s avatar`}
          src={props.ownerAvatarUrl}
          width={48}
          height={48}
          className="rounded-full bg-mono-200 shadow-md"
        />
      </div>

      <div className="w-full">
        <Typography variant="body1" fw="bold" className="dark:text-mono-0">
          {props.filename}
        </Typography>

        <Typography
          variant="body2"
          fw="normal"
          className="dark:text-mono-100 mb-1"
          component="p"
        >
          {props.description}
        </Typography>

        <div className="flex gap-2 items-start">
          <div className="inline-flex items-center">
            <StarIcon className="mr-1 dark:text-mono-100" />{' '}
            {props.stargazerCount}
          </div>

          <div className="inline-flex items-center">
            <LockOpen1Icon className="mr-1 dark:text-mono-100" /> {props.locks}
          </div>
        </div>
      </div>
    </Card>
  );
};
