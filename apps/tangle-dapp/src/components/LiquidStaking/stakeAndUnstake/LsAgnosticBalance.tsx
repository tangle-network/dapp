import { BN } from '@polkadot/util';
import { WalletFillIcon, WalletLineIcon } from '@tangle-network/icons';
import {
  AmountFormatStyle,
  formatDisplayAmount,
  SkeletonLoader,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@tangle-network/ui-components';
import { EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/ui-components/constants';
import { FC, useCallback, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import useLsActivePoolDisplayName from '../../../data/liquidStaking/useLsActivePoolDisplayName';
import useLsAgnosticBalance from './useLsAgnosticBalance';
import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';

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
  const { displayName: lsActivePoolDisplayName } = useLsActivePoolDisplayName();

  const networkTokenSymbol = useNetworkStore(
    (store) => store.network2?.tokenSymbol,
  );

  const formattedBalance = useMemo(() => {
    // No account is active; display a placeholder instead of a loading state.
    if (balance === EMPTY_VALUE_PLACEHOLDER) {
      return EMPTY_VALUE_PLACEHOLDER;
    }
    // Balance is still loading.
    else if (balance === null) {
      return null;
    }

    const formattedBalance = formatDisplayAmount(
      balance,
      TANGLE_TOKEN_DECIMALS,
      AmountFormatStyle.SHORT,
    );

    const unit = isNative
      ? (networkTokenSymbol ?? EMPTY_VALUE_PLACEHOLDER)
      : (lsActivePoolDisplayName?.toUpperCase() ?? EMPTY_VALUE_PLACEHOLDER);

    return `${formattedBalance} ${unit}`.trim();
  }, [balance, isNative, lsActivePoolDisplayName, networkTokenSymbol]);

  const isClickable =
    onlyShowTooltipWhenBalanceIsSet &&
    balance instanceof BN &&
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
        <SkeletonLoader className="w-12 rounded-2xl bg-mono-60" size="md" />
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
