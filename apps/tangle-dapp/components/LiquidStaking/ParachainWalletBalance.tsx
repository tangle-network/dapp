import { BN_ZERO, formatBalance } from '@polkadot/util';
import { WalletLineIcon } from '@webb-tools/icons';
import { SkeletonLoader, Typography } from '@webb-tools/webb-ui-components';
import { FC, useMemo } from 'react';

import { EMPTY_VALUE_PLACEHOLDER } from '../../constants';
import { LiquidStakingToken } from '../../constants/liquidStaking';
import useParachainBalances from '../../data/liquidStaking/useParachainBalances';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';

export type ParachainWalletBalanceProps = {
  isNative?: boolean;
  token: LiquidStakingToken;
};

const ParachainWalletBalance: FC<ParachainWalletBalanceProps> = ({
  isNative,
  token,
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

    return formatBalance(balance);
  }, [activeSubstrateAddress, balance]);

  return (
    <Typography
      variant="body1"
      fw="bold"
      className="flex gap-1 items-center dark:text-mono-80"
    >
      <WalletLineIcon />{' '}
      {formattedBalance === null ? (
        <SkeletonLoader size="md" />
      ) : (
        formattedBalance
      )}
    </Typography>
  );
};

export default ParachainWalletBalance;
