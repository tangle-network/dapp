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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { evmToSubstrateAddress } from '../../utils';

export type AccountAddressProps = {
  activeAddress: string | null;
  className?: string;
};

const AccountAddress: FC<AccountAddressProps> = ({
  activeAddress,
  className,
}) => {
  const [isHiddenValue] = useHiddenValue();

  const isEvmAccountAddress =
    activeAddress === null ? null : isEthereumAddress(activeAddress);

  const [isDisplayingEvmAddress, setIsDisplayingEvmAddress] =
    useState(isEvmAccountAddress);

  // Make sure the address type is updated when the active address changes.
  useEffect(() => {
    setIsDisplayingEvmAddress(isEvmAccountAddress);
  }, [activeAddress, isEvmAccountAddress]);

  const displayAddress = useMemo(() => {
    if (activeAddress === null) {
      return null;
    }

    return isDisplayingEvmAddress
      ? activeAddress
      : evmToSubstrateAddress(activeAddress);
  }, [activeAddress, isDisplayingEvmAddress]);

  const possiblyHiddenAddress = useMemo(
    () =>
      isHiddenValue
        ? Array.from({ length: 130 })
            .map(() => '*')
            .join('')
        : displayAddress,
    [displayAddress, isHiddenValue]
  );

  // Switch between EVM & Substrate addresses.
  const handleAddressTypeToggle = useCallback(() => {
    setIsDisplayingEvmAddress((previous) => !previous);
  }, []);

  const iconFillColorClass = 'dark:!fill-mono-80 !fill-mono-160';

  const shortenFn = isHiddenValue
    ? shortenString
    : isDisplayingEvmAddress
    ? shortenHex
    : shortenString;

  const avatarIcon =
    activeAddress === null ? (
      <div className="w-6 h-6 rounded-full bg-mono-40 dark:bg-mono-160" />
    ) : (
      <Avatar
        value={displayAddress}
        theme={isDisplayingEvmAddress ? 'ethereum' : 'substrate'}
      />
    );

  return (
    <div className={twMerge('flex items-center gap-1', className)}>
      <IconWithTooltip icon={avatarIcon} content="Account public key" />

      <Typography variant="body1" fw="normal">
        Address:
      </Typography>

      <Tooltip>
        <TooltipTrigger className="cursor-default">
          <Typography variant="body1" fw="normal" className="text-mono-160">
            {possiblyHiddenAddress !== null
              ? shortenFn(possiblyHiddenAddress, 5)
              : '--'}
          </Typography>
        </TooltipTrigger>

        <TooltipBody className="max-w-full">{displayAddress}</TooltipBody>
      </Tooltip>

      {displayAddress !== null && (
        <CopyWithTooltip
          className="!bg-transparent !p-0"
          iconClassName={iconFillColorClass}
          copyLabel={`Copy ${
            isDisplayingEvmAddress ? 'EVM' : 'Substrate'
          } address`}
          textToCopy={displayAddress}
        />
      )}

      {isEvmAccountAddress && (
        <Tooltip>
          <TooltipTrigger>
            <LoopRightFillIcon
              className={iconFillColorClass}
              onClick={handleAddressTypeToggle}
            />
          </TooltipTrigger>

          <TooltipBody>
            Switch to {isDisplayingEvmAddress ? 'Substrate' : 'EVM'} address
          </TooltipBody>
        </Tooltip>
      )}
    </div>
  );
};

export default AccountAddress;
