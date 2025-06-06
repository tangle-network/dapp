import { isEthereumAddress } from '@polkadot/util-crypto';
import { LoopRightFillIcon } from '@tangle-network/icons';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import useActiveAccountAddress from '@tangle-network/tangle-shared-ui/hooks/useActiveAccountAddress';
import {
  CopyWithTooltip,
  shortenHex,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  toSubstrateAddress,
  Typography,
  useHiddenValue,
} from '@tangle-network/ui-components';
import { isSolanaAddress } from '@tangle-network/ui-components/utils/isSolanaAddress';
import { Avatar } from '@tangle-network/ui-components/components/Avatar';
import { IconWithTooltip } from '@tangle-network/ui-components/components/IconWithTooltip';
import { EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/ui-components/constants';
import { shortenString } from '@tangle-network/ui-components/utils/shortenString';
import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

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

    if (isSolanaAddress(activeAccountAddress)) {
      return activeAccountAddress;
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

  const handleAddressTypeToggle = useCallback(() => {
    if (
      activeAccountAddress !== null &&
      !isSolanaAddress(activeAccountAddress)
    ) {
      setIsDisplayingEvmAddress((previous) => !previous);
    }
  }, [activeAccountAddress, setIsDisplayingEvmAddress]);

  const iconFillColorClass = 'dark:!fill-mono-80 !fill-mono-160';

  const shortenFn = isHiddenValue
    ? shortenString
    : activeAccountAddress === null
      ? shortenString
      : isSolanaAddress(activeAccountAddress)
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

      <Typography variant="body1">Address:</Typography>

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
