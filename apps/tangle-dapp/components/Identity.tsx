'use client';

import { isEthereumAddress } from '@polkadot/util-crypto';
import { LoopRightFillIcon } from '@webb-tools/icons';
import {
  CopyWithTooltip,
  shortenHex,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
  useHiddenValue,
} from '@webb-tools/webb-ui-components';
import { Avatar } from '@webb-tools/webb-ui-components/components/Avatar';
import { IconWithTooltip } from '@webb-tools/webb-ui-components/components/IconWithTooltip';
import { shortenString } from '@webb-tools/webb-ui-components/utils/shortenString';
import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { convertToSubstrateAddress } from '../utils';

export type IdentityProps = {
  address: string;
  iconTooltipContent: string;
  className?: string;
};

const Identity: FC<IdentityProps> = ({
  address,
  iconTooltipContent,
  className,
}) => {
  const [isHiddenValue] = useHiddenValue();
  const isEvmAccountAddress = isEthereumAddress(address);

  const [isDisplayingEvmAddress, setIsDisplayingEvmAddress] =
    useState(isEvmAccountAddress);

  const [displayAddress, setDisplayAddress] = useState(address);

  const shortenFn = isHiddenValue
    ? shortenString
    : isDisplayingEvmAddress
    ? shortenHex
    : shortenString;

  const finalDisplayAddress = isHiddenValue
    ? Array.from({ length: 130 })
        .map(() => '*')
        .join('')
    : displayAddress;

  // Switch between EVM & Substrate addresses.
  const handleAddressTypeToggle = useCallback(() => {
    setIsDisplayingEvmAddress((previous) => !previous);

    if (!isDisplayingEvmAddress && isEvmAccountAddress) {
      setDisplayAddress(address);
    } else if (isEvmAccountAddress) {
      setDisplayAddress(convertToSubstrateAddress(address));
    }
  }, [address, isDisplayingEvmAddress, isEvmAccountAddress]);

  const prefix = isDisplayingEvmAddress ? 'EVM' : 'Substrate';
  const oppositePrefix = isDisplayingEvmAddress ? 'Substrate' : 'EVM';
  const iconFillColorClassName = 'dark:!fill-mono-80 !fill-mono-160';

  return (
    <div className={twMerge('flex items-center gap-1', className)}>
      <IconWithTooltip
        icon={<Avatar value={address} theme="ethereum" />}
        content={iconTooltipContent}
      />

      <Typography variant="body1" fw="normal">
        Address:
      </Typography>

      <Tooltip>
        <TooltipTrigger className="cursor-default">
          <Typography variant="body1" fw="normal" className="text-mono-160">
            {shortenFn(finalDisplayAddress, 5)}
          </Typography>
        </TooltipTrigger>

        <TooltipBody className="max-w-full">{displayAddress}</TooltipBody>
      </Tooltip>

      <CopyWithTooltip
        className="!bg-transparent !p-0"
        iconClassName={iconFillColorClassName}
        copyLabel={`Copy ${prefix} address`}
        textToCopy={finalDisplayAddress}
      />

      {isEvmAccountAddress && (
        <Tooltip>
          <TooltipTrigger>
            <LoopRightFillIcon
              className={iconFillColorClassName}
              onClick={handleAddressTypeToggle}
            />
          </TooltipTrigger>

          <TooltipBody>Switch to {oppositePrefix} address</TooltipBody>
        </Tooltip>
      )}
    </div>
  );
};

export default Identity;
