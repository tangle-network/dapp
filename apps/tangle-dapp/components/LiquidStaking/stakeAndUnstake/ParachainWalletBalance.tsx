'use client';

import { BN_ZERO } from '@polkadot/util';
import { WalletFillIcon, WalletLineIcon } from '@webb-tools/icons';
import {
  SkeletonLoader,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { EMPTY_VALUE_PLACEHOLDER } from '../../../constants';
import { LsToken } from '../../../constants/liquidStaking/types';
import useParachainBalances from '../../../data/liquidStaking/useParachainBalances';
import useSubstrateAddress from '../../../hooks/useSubstrateAddress';
import formatBn from '../../../utils/formatBn';

export type ParachainWalletBalanceProps = {
  isNative?: boolean;
  token: LsToken;
  decimals: number;
  tooltip?: string;
  onlyShowTooltipWhenBalanceIsSet?: boolean;
  onClick?: () => void;
};

const ParachainWalletBalance: FC<ParachainWalletBalanceProps> = ({
  isNative = true,
  token,
  decimals,
  tooltip,
  onlyShowTooltipWhenBalanceIsSet = true,
  onClick,
}) => {
  const [isHovering, setIsHovering] = useState(false);

  const activeSubstrateAddress = useSubstrateAddress();
  const { nativeBalances, liquidBalances } = useParachainBalances();
  const map = isNative ? nativeBalances : liquidBalances;

  const balance = useMemo(() => {
    if (map === null) {
      return null;
    }

    return map.get(token) ?? BN_ZERO;
  }, [map, token]);

  const formattedBalance = useMemo(() => {
    // No account is active.
    if (activeSubstrateAddress === null) {
      return EMPTY_VALUE_PLACEHOLDER;
    }
    // Balance is still loading.
    else if (balance === null) {
      return null;
    }

    return formatBn(balance, decimals, {
      fractionMaxLength: undefined,
      includeCommas: true,
    });
  }, [activeSubstrateAddress, balance, decimals]);

  const isClickable =
    onlyShowTooltipWhenBalanceIsSet && balance !== null && !balance.isZero();

  const handleClick = useCallback(() => {
    if (!isClickable || onClick === undefined) {
      return;
    }

    onClick();
  }, [isClickable, onClick]);

  const content = (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={twMerge(
        'group flex gap-1 items-center justify-center',
        isClickable && 'cursor-pointer',
      )}
    >
      {isHovering && isClickable ? (
        <WalletFillIcon
          className={twMerge(isClickable && 'dark:fill-mono-0')}
        />
      ) : (
        <WalletLineIcon className="dark:fill-mono-80" />
      )}

      {formattedBalance === null ? (
        <SkeletonLoader className="rounded-2xl w-12" size="md" />
      ) : (
        <Typography
          variant="body1"
          fw="bold"
          className={twMerge(
            'flex gap-1 items-center dark:text-mono-80',
            isClickable && 'group-hover:dark:text-mono-0',
          )}
        >
          {formattedBalance}
        </Typography>
      )}
    </div>
  );

  if (tooltip === undefined || !isClickable) {
    return content;
  }

  // Otherwise, the tooltip is set and it should be shown.
  return (
    <Tooltip>
      <TooltipTrigger>{content}</TooltipTrigger>

      <TooltipBody className="max-w-[185px] w-auto">
        <span>{tooltip}</span>
      </TooltipBody>
    </Tooltip>
  );
};

export default ParachainWalletBalance;
