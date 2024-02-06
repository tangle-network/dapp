import { isEthereumAddress } from '@polkadot/util-crypto';
import { FileCopyLine, LoopRightFillIcon } from '@webb-tools/icons';
import {
  shortenHex,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
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
import { forwardRef, useCallback, useEffect, useState } from 'react';
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

    useEffect(() => {
      setDisplayAddress(address);
    }, [address]);

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
        setDisplayAddress(convertToSubstrateAddress(address) ?? '');
      }
    }, [address, isDisplayingEvmAddress, isEvmAccountAddress]);

    const handleCopy = useCallback(() => {
      copyableResult.copy(finalDisplayAddress);

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
        className={twMerge(className, 'flex items-center gap-2')}
        ref={ref}
      >
        <IconWithTooltip
          icon={<Avatar value={address} theme="ethereum" />}
          content={iconTooltipContent}
        />

        <span>Address: </span>

        <Tooltip>
          <TooltipTrigger>{shortenFn(finalDisplayAddress, 5)}</TooltipTrigger>

          <TooltipBody>{displayAddress}</TooltipBody>
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

Identity.displayName = Identity.name;

export default Identity;
