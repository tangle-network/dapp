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

import { convertToSubstrateAddress } from '../../utils';

export type AccountAddressProps = {
  activeAddress: string | null;
  className?: string;
};

const AccountAddress: FC<AccountAddressProps> = ({
  activeAddress,
  className,
}) => {
  const [isHiddenValue] = useHiddenValue();
  const [displayAddress, setDisplayAddress] = useState(activeAddress);

  const isEvmAccountAddress =
    activeAddress === null ? null : isEthereumAddress(activeAddress);

  const [isDisplayingEvmAddress, setIsDisplayingEvmAddress] =
    useState(isEvmAccountAddress);

  const shortenFn = isHiddenValue
    ? shortenString
    : isDisplayingEvmAddress
    ? shortenHex
    : shortenString;

  const possiblyHiddenAddress = useMemo(
    () =>
      isHiddenValue
        ? Array.from({ length: 130 })
            .map(() => '*')
            .join('')
        : displayAddress,
    [displayAddress, isHiddenValue]
  );

  const updateAddress = useCallback(
    (isDisplayingEvmAddress: boolean) => {
      if (activeAddress === null) {
        setDisplayAddress(null);

        return;
      }

      const nextDisplayAddress = isDisplayingEvmAddress
        ? activeAddress
        : convertToSubstrateAddress(activeAddress);

      setDisplayAddress(nextDisplayAddress);
    },
    [activeAddress]
  );

  // Switch between EVM & Substrate addresses.
  const handleAddressTypeToggle = useCallback(() => {
    setIsDisplayingEvmAddress((previous) => !previous);
    updateAddress(!isDisplayingEvmAddress);
  }, [isDisplayingEvmAddress, updateAddress]);

  // Update the address when the active address prop changes.
  useEffect(() => {
    if (isDisplayingEvmAddress !== null) {
      updateAddress(isDisplayingEvmAddress);
    }
  }, [isDisplayingEvmAddress, updateAddress, activeAddress]);

  const iconFillColorClass = 'dark:!fill-mono-80 !fill-mono-160';

  return (
    <div className={twMerge('flex items-center gap-1', className)}>
      <IconWithTooltip
        icon={<Avatar value={activeAddress ?? '0x0'} theme="ethereum" />}
        content="Account public key"
      />

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
