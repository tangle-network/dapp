import { Card, Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { CircuitItem } from '../app/page';
import Image from 'next/image';
import assert from 'assert';
import { StarIcon } from '@radix-ui/react-icons';

export const CircuitCard: FC<CircuitItem> = (props) => {
  assert(props.locks >= 0, 'Lock count should never be negative.');

  return (
    <Card className="flex flex-row gap-3 space-y-0 py-5 px-6">
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
        <div className="flex">
          <Typography variant="body1" fw="bold" className="dark:text-mono-0">
            {props.filename}
          </Typography>

          <div className="flex items-center ml-auto">
            <StarIcon className="mr-1 dark:text-mono-100" />{' '}
            {props.stargazerCount}
          </div>
        </div>

        <Typography
          variant="body2"
          fw="normal"
          className="dark:text-mono-100"
          component="p"
        >
          {props.description}
        </Typography>
      </div>
    </Card>
  );
};
