import { forwardRef } from 'react';
import { isHex } from 'viem';
import { twMerge } from 'tailwind-merge';
import { WalletLineIcon, ShieldKeyholeLineIcon } from '@webb-tools/icons';

import { AddressChipProps } from './types';
import { Typography } from '../../typography';
import { Chip } from '../Chip';
import { shortenHex, shortenString } from '../../utils';

const AddressChip = forwardRef<HTMLSpanElement, AddressChipProps>(
  ({ className: classNameProp, address, isNoteAccount = false }, ref) => {
    return (
      <Chip
        color="grey"
        className={twMerge(
          'w-fit flex items-center gap-1 bg-mono-20 dark:bg-mono-140 rounded-md px-2 py-1',
          classNameProp
        )}
        ref={ref}
      >
        {isNoteAccount ? (
          <ShieldKeyholeLineIcon className="fill-mono-120 dark:fill-mono-60" />
        ) : (
          <WalletLineIcon className="fill-mono-120 dark:fill-mono-60" />
        )}

        <Typography
          variant="body4"
          fw="bold"
          component="span"
          className="inline-block uppercase text-mono-120 dark:text-mono-60"
        >
          {isHex(address) ? shortenHex(address, 2) : shortenString(address, 2)}
        </Typography>
      </Chip>
    );
  }
);

export default AddressChip;
