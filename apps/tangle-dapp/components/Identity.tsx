'use client';

import { isEthereumAddress } from '@polkadot/util-crypto';
import { FileCopyLine, LoopRightFillIcon } from '@webb-tools/icons';
import {
  shortenHex,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
  useHiddenValue,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { Avatar } from '@webb-tools/webb-ui-components/components/Avatar';
import { IconWithTooltip } from '@webb-tools/webb-ui-components/components/IconWithTooltip';
import { KeyValueWithButton } from '@webb-tools/webb-ui-components/components/KeyValueWithButton';
import { useCopyable } from '@webb-tools/webb-ui-components/hooks/useCopyable';
import type { PropsOf } from '@webb-tools/webb-ui-components/types';
import { shortenString } from '@webb-tools/webb-ui-components/utils/shortenString';
import type { ComponentProps, ElementRef } from 'react';
import { forwardRef, useCallback, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { convertToSubstrateAddress } from '../utils';

type Props = {
  address: string;
  iconTooltipContent: string;
  label?: string;
  fontWeight?: ComponentProps<typeof KeyValueWithButton>['valueFontWeight'];
};

const Identity = forwardRef<ElementRef<'div'>, PropsOf<'div'> & Props>(
  (props, ref) => {
    const {
      address,
      label,
      iconTooltipContent,
      className,
      fontWeight,
      ...divProps
    } = props;

    const [isHiddenValue] = useHiddenValue();
    const copyableResult = useCopyable();
    const isEvmAccountAddress = isEthereumAddress(address);
    const { notificationApi } = useWebbUI();

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

    const handleAddressTypeToggle = useCallback(() => {
      setIsDisplayingEvmAddress((previous) => !previous);

      if (!isDisplayingEvmAddress && isEvmAccountAddress) {
        setDisplayAddress(address);
      } else if (isEvmAccountAddress) {
        setDisplayAddress(convertToSubstrateAddress(address));
      }
    }, [address, isDisplayingEvmAddress, isEvmAccountAddress]);

    const handleCopy = useCallback(() => {
      copyableResult.copy(finalDisplayAddress);

      // TODO: Instead of showing a toast notification, change the tooltip to show `Copied!` for a few seconds. This way, it stays consistent with the rest of the places that use Copy buttons.
      notificationApi({
        variant: 'success',
        message: 'Address copied to clipboard',
      });
    }, [copyableResult, finalDisplayAddress, notificationApi]);

    const prefix = isDisplayingEvmAddress ? 'EVM' : 'Substrate';
    const oppositePrefix = isDisplayingEvmAddress ? 'Substrate' : 'EVM';

    return (
      <div
        {...divProps}
        className={twMerge(className, 'flex items-center gap-1')}
        ref={ref}
      >
        <IconWithTooltip
          icon={<Avatar value={address} theme="ethereum" />}
          content={iconTooltipContent}
        />

        <Typography variant="body1" fw="normal">
          Address:
        </Typography>

        <Tooltip>
          <TooltipTrigger className="cursor-default">
            <Typography variant="body1" fw="normal">
              {shortenFn(finalDisplayAddress, 5)}
            </Typography>
          </TooltipTrigger>

          <TooltipBody className="max-w-full">{displayAddress}</TooltipBody>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <FileCopyLine onClick={handleCopy} />
          </TooltipTrigger>

          <TooltipBody>Copy {prefix} address</TooltipBody>
        </Tooltip>

        {isEvmAccountAddress && (
          <Tooltip>
            <TooltipTrigger>
              <LoopRightFillIcon onClick={handleAddressTypeToggle} />
            </TooltipTrigger>

            <TooltipBody>Switch to {oppositePrefix} address</TooltipBody>
          </Tooltip>
        )}
      </div>
    );
  }
);

Identity.displayName = 'Identity';

export default Identity;
