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

import { EMPTY_VALUE_PLACEHOLDER } from '../../constants';
import useNetworkStore from '../../context/useNetworkStore';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import { toSubstrateAddress } from '../../utils';

const AccountAddress: FC = () => {
  const { network } = useNetworkStore();
  const activeAccountAddress = useActiveAccountAddress();
  const [isHiddenValue] = useHiddenValue();

  const isEvmAccountAddress =
    activeAccountAddress === null
      ? null
      : isEthereumAddress(activeAccountAddress);

  const [isDisplayingEvmAddress, setIsDisplayingEvmAddress] =
    useState(isEvmAccountAddress);

  // Make sure the address type is updated when the active address changes.
  useEffect(() => {
    setIsDisplayingEvmAddress(isEvmAccountAddress);
  }, [activeAccountAddress, isEvmAccountAddress]);

  const displayAddress = useMemo(() => {
    if (activeAccountAddress === null) {
      return null;
    }

    return isDisplayingEvmAddress
      ? activeAccountAddress
      : toSubstrateAddress(activeAccountAddress, network.ss58Prefix);
  }, [activeAccountAddress, isDisplayingEvmAddress, network.ss58Prefix]);

  const possiblyHiddenAddress = useMemo(
    () =>
      isHiddenValue
        ? Array.from({ length: 130 })
            .map(() => '*')
            .join('')
        : displayAddress,
    [displayAddress, isHiddenValue],
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
    activeAccountAddress === null ? (
      <div className="w-6 h-6 rounded-full bg-mono-40 dark:bg-mono-160" />
    ) : (
      <Avatar
        value={displayAddress}
        theme={isDisplayingEvmAddress ? 'ethereum' : 'substrate'}
      />
    );

  return (
    <div className="flex items-center gap-1">
      <IconWithTooltip icon={avatarIcon} content="Account public key" />

      <Typography variant="body1" fw="normal">
        Address:
      </Typography>

      <Tooltip>
        <TooltipTrigger className="cursor-default">
          <Typography variant="body1" fw="normal" className="text-mono-160">
            {possiblyHiddenAddress !== null
              ? shortenFn(possiblyHiddenAddress, 5)
              : EMPTY_VALUE_PLACEHOLDER}
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
