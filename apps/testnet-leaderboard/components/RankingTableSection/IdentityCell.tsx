'use client';

import { isEthereumAddress } from '@polkadot/util-crypto';
import { FileCopyLine } from '@tangle-network/icons';
import { IdentityType } from '@tangle-network/tangle-shared-ui/utils/polkadot/identity';
import { Avatar } from '@tangle-network/webb-ui-components/components/Avatar';
import {
  Tooltip,
  TooltipBody,
  TooltipTrigger,
} from '@tangle-network/webb-ui-components/components/Tooltip';
import { useCopyable } from '@tangle-network/webb-ui-components/hooks/useCopyable';
import { Typography } from '@tangle-network/webb-ui-components/typography/Typography';
import { shortenString } from '@tangle-network/webb-ui-components/utils/shortenString';
import { type FC } from 'react';

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
        {identity?.name || shortenString(address)}
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
