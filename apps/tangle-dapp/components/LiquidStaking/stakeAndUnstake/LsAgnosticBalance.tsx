'use client';

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
import { LS_DERIVATIVE_TOKEN_PREFIX } from '../../../constants/liquidStaking/constants';
import { useLsStore } from '../../../data/liquidStaking/useLsStore';
import formatBn from '../../../utils/formatBn';
import getLsProtocolDef from '../../../utils/liquidStaking/getLsProtocolDef';
import useLsAgnosticBalance from './useLsAgnosticBalance';

export type LsAgnosticBalanceProps = {
  isNative?: boolean;
  tooltip?: string;
  onlyShowTooltipWhenBalanceIsSet?: boolean;
  onClick?: () => void;
};

const LsAgnosticBalance: FC<LsAgnosticBalanceProps> = ({
  isNative = true,
  tooltip,
  onlyShowTooltipWhenBalanceIsSet = true,
  onClick,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const balance = useLsAgnosticBalance(isNative);
  const { selectedProtocolId } = useLsStore();
  const protocol = getLsProtocolDef(selectedProtocolId);

  const formattedBalance = useMemo(() => {
    // No account is active; display a placeholder instead of a loading state.
    if (balance === EMPTY_VALUE_PLACEHOLDER) {
      return EMPTY_VALUE_PLACEHOLDER;
    }
    // Balance is still loading.
    else if (balance === null) {
      return null;
    }

    const formattedBalance = formatBn(balance, protocol.decimals, {
      includeCommas: true,
    });

    const derivativePrefix = isNative ? '' : LS_DERIVATIVE_TOKEN_PREFIX;

    return `${formattedBalance} ${derivativePrefix}${protocol.token}`;
  }, [balance, protocol.decimals, isNative, protocol.token]);

  const isClickable =
    onlyShowTooltipWhenBalanceIsSet &&
    balance !== null &&
    typeof balance !== 'string' &&
    !balance.isZero();

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

export default LsAgnosticBalance;
