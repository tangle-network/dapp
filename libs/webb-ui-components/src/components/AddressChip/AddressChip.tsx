import { isAddress, isEthereumAddress } from '@polkadot/util-crypto';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { WalletLineIcon, ShieldKeyholeLineIcon } from '@webb-tools/icons';

import { AddressChipProps } from './types';
import { Typography } from '../../typography';
import { Chip } from '../Chip';
import SkeletonLoader from '../SkeletonLoader';
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

        {typeof address === 'string' ? (
          <Typography
            variant="body4"
            fw="bold"
            ta="center"
            component="span"
            className="inline-block uppercase text-mono-120 dark:text-mono-60"
          >
            {/* Eth: 0xXX...XX; Substrate: XXX...XXX, Not an Address: N/A */}
            {isEthereumAddress(address)
              ? shortenHex(address, 2)
              : isAddress(address)
              ? shortenString(address, 3)
              : 'N/A'}
          </Typography>
        ) : (
          <SkeletonLoader />
        )}
      </Chip>
    );
  }
);

export default AddressChip;
