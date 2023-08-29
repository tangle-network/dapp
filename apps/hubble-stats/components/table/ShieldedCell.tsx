import { FC } from 'react';
import Link from 'next/link';
import { Typography } from '@webb-tools/webb-ui-components';
import { shortenHex } from '@webb-tools/webb-ui-components/utils';
import { ExternalLinkLine } from '@webb-tools/icons';

import { ShieldedCellProps } from './types';

const ShieldedCell: FC<ShieldedCellProps> = ({
  title,
  address,
  poolAddress,
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col">
        <Link href={`/pool/${poolAddress}`}>
          <Typography
            variant="body1"
            fw="bold"
            className="text-mono-140 dark:text-mono-40 hover:underline"
          >
            {title}
          </Typography>
        </Link>

        <div className="flex items-center gap-1">
          <Typography
            variant="body1"
            className="text-mono-140 dark:text-mono-40"
          >
            {shortenHex(address, 4)}
          </Typography>
          {/* TODO: update href */}
          {/* <a href="#" target="_blank" rel="noreferrer">
            <ExternalLinkLine className="fill-mono-140 dark:fill-mono-40" />
          </a> */}
        </div>
      </div>
    </div>
  );
};

export default ShieldedCell;
