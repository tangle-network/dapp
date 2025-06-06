import { isEthereumAddress } from '@polkadot/util-crypto';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import WalletLineIcon from '@tangle-network/icons/WalletLineIcon';
import ShieldKeyholeLineIcon from '@tangle-network/icons/ShieldKeyholeLineIcon';

import { AddressChipProps } from './types';
import { Typography } from '../../typography/Typography';
import { Chip } from '../Chip';
import SkeletonLoader from '../SkeletonLoader';
import {
  isSolanaAddress,
  isSubstrateAddress,
  shortenHex,
  shortenString,
} from '../../utils';
import { EMPTY_VALUE_PLACEHOLDER } from '../../constants';

const AddressChip = forwardRef<HTMLSpanElement, AddressChipProps>(
  ({ className: classNameProp, address, isNoteAccount = false }, ref) => {
    return (
      <Chip
        color="grey"
        className={twMerge(
          'w-fit flex items-center gap-1 bg-mono-20 dark:bg-mono-140 rounded-md px-2 py-1',
          classNameProp,
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
              : isSubstrateAddress(address) || isSolanaAddress(address)
                ? shortenString(address, 3)
                : EMPTY_VALUE_PLACEHOLDER}
          </Typography>
        ) : (
          <SkeletonLoader />
        )}
      </Chip>
    );
  },
);

export default AddressChip;
