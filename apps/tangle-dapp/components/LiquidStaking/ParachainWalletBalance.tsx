import { BN_ZERO } from '@polkadot/util';
import { WalletLineIcon } from '@webb-tools/icons';
import {
  SkeletonLoader,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { EMPTY_VALUE_PLACEHOLDER } from '../../constants';
import { LiquidStakingToken } from '../../constants/liquidStaking';
import useParachainBalances from '../../data/liquidStaking/useParachainBalances';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import formatBn from '../../utils/formatBn';

export type ParachainWalletBalanceProps = {
  isNative?: boolean;
  token: LiquidStakingToken;
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
  const activeSubstrateAddress = useSubstrateAddress();
  const { nativeBalances, liquidBalances } = useParachainBalances();
  const map = isNative ? nativeBalances : liquidBalances;

  const balance = (() => {
    if (map === null) {
      return null;
    }

    return map.get(token) ?? BN_ZERO;
  })();

  const formattedBalance = useMemo(() => {
    // No account is active.
    if (activeSubstrateAddress === null) {
      return EMPTY_VALUE_PLACEHOLDER;
    }
    // Balance is still loading.
    else if (balance === null) {
      return null;
    }

    return formatBn(balance, decimals);
  }, [activeSubstrateAddress, balance, decimals]);

  const content = (
    <Typography
      onClick={onClick}
      variant="body1"
      fw="bold"
      className={twMerge(
        'flex gap-1 items-center dark:text-mono-80',
        onClick !== undefined && 'cursor-pointer',
      )}
    >
      <WalletLineIcon />{' '}
      {formattedBalance === null ? (
        <SkeletonLoader className="rounded-2xl w-12" size="md" />
      ) : (
        formattedBalance
      )}
    </Typography>
  );

  const shouldShowTooltip = onlyShowTooltipWhenBalanceIsSet && balance !== null;

  if (tooltip === undefined || !shouldShowTooltip) {
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
