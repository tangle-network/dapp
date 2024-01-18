'use client';

import { isEthereumAddress } from '@polkadot/util-crypto';
import { FileCopyLine } from '@webb-tools/icons';
import { Avatar } from '@webb-tools/webb-ui-components/components/Avatar';
import {
  Tooltip,
  TooltipBody,
  TooltipTrigger,
} from '@webb-tools/webb-ui-components/components/Tooltip';
import { useCopyable } from '@webb-tools/webb-ui-components/hooks/useCopyable';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { shortenString } from '@webb-tools/webb-ui-components/utils/shortenString';
import { type FC } from 'react';

import { IdentityType } from './types';

const IdentityCell: FC<{ address: string; identity: IdentityType }> = ({
  address,
  identity,
}) => {
  const { isCopied, copy } = useCopyable();

  return (
    <div className="flex items-center max-w-[160px] 2xl:max-w-xs gap-2">
      <Avatar
        value={address}
        theme={isEthereumAddress(address) ? 'ethereum' : 'substrate'}
        className="[&_*]:!cursor-copy"
        size="sm"
      />

      <Typography
        variant="mkt-small-caps"
        fw="semibold"
        className="!normal-case truncate"
      >
        {identity?.info.display || shortenString(address)}
      </Typography>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => copy(address)}
            disabled={isCopied}
            className="disabled:cursor-not-allowed"
          >
            <FileCopyLine className="!fill-current" />
          </button>
        </TooltipTrigger>

        <TooltipBody className="font-semibold">
          {isCopied ? 'Copied' : address}
        </TooltipBody>
      </Tooltip>
    </div>
  );
};

export default IdentityCell;
