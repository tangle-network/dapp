import { DropdownMenuTrigger as DropdownTrigger } from '@radix-ui/react-dropdown-menu';
import { ShuffleLine } from '@tangle-network/icons';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import {
  Dropdown,
  DropdownBody,
} from '@tangle-network/ui-components/components/Dropdown';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { FC, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { useBridgeTxQueue } from '../../context/bridge/BridgeTxQueueContext';
import BridgeTxQueueItem from './BridgeTxQueueItem';

const BridgeTxQueueDropdown: FC<{
  dropdownButtonClassName?: string;
  dropdownBodyClassName?: string;
}> = ({ dropdownButtonClassName, dropdownBodyClassName }) => {
  const { txQueue, isOpenQueueDropdown, setIsOpenQueueDropdown } =
    useBridgeTxQueue();

  // Sort the latest tx to the top
  const sortedTxQueue = useMemo(() => {
    return txQueue
      .slice()
      .sort((a, b) => b.creationTimestamp - a.creationTimestamp);
  }, [txQueue]);

  if (!txQueue.length) {
    return null;
  }

  return (
    <Dropdown
      radixRootProps={{
        open: isOpenQueueDropdown,
        onOpenChange: setIsOpenQueueDropdown,
      }}
    >
      <DropdownTrigger asChild>
        <Button
          variant="secondary"
          className={twMerge(
            'rounded-full border-2 py-2 px-4',
            'bg-mono-0/10 border-mono-60 dark:border-mono-140',
            'dark:bg-mono-0/5 dark:border-mono-140',
            'hover:bg-mono-100/10 dark:hover:bg-mono-0/10',
            'hover:border-mono-60 dark:hover:border-mono-140',
            dropdownButtonClassName,
          )}
        >
          <div className="flex items-center gap-1">
            <ShuffleLine className="fill-mono-160 dark:fill-mono-0" />
            <Typography
              variant="body1"
              fw="semibold"
              className="text-mono-160 dark:text-mono-0"
            >
              ({txQueue.length})
            </Typography>
          </div>
        </Button>
      </DropdownTrigger>

      <DropdownBody
        align="start"
        className={twMerge(
          'max-h-80 w-[calc(100vw-32px)] md:w-[30rem]',
          'overflow-scroll overflow-x-hidden dark:bg-mono-180',
          'mt-2 mr-4 md:mr-8',
          dropdownBodyClassName,
        )}
      >
        {sortedTxQueue.map((tx) => {
          return (
            <BridgeTxQueueItem
              key={tx.hash}
              tx={tx}
              className="rounded-none border-b last:!border-b-0 border-mono-60 dark:border-mono-140"
            />
          );
        })}
      </DropdownBody>
    </Dropdown>
  );
};

export default BridgeTxQueueDropdown;
