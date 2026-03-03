import { BN } from '@polkadot/util';
import {
  AmountFormatStyle,
  EMPTY_VALUE_PLACEHOLDER,
  formatDisplayAmount,
  InfoIconWithTooltip,
  Typography,
} from '@tangle-network/ui-components';
import { FC, useMemo } from 'react';
import { useAccount, useBalance } from 'wagmi';

const Balance: FC = () => {
  const { address } = useAccount();

  // Native balance (ETH/Base ETH)
  const { data: nativeBalance, isLoading } = useBalance({
    address,
    query: {
      enabled: Boolean(address),
    },
  });

  const formattedBalance = useMemo(() => {
    if (!nativeBalance) {
      return null;
    }

    const balanceBn = new BN(nativeBalance.value.toString());

    return formatDisplayAmount(
      balanceBn,
      nativeBalance.decimals,
      AmountFormatStyle.SHORT,
    );
  }, [nativeBalance]);

  const symbol = nativeBalance?.symbol ?? 'ETH';

  const displayValue = isLoading
    ? EMPTY_VALUE_PLACEHOLDER
    : (formattedBalance ?? EMPTY_VALUE_PLACEHOLDER);

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center gap-1 sm:mr-auto">
        <Typography variant="body1" className="text-mono-120 dark:text-mono-80">
          Balance
        </Typography>

        <InfoIconWithTooltip content="Native token balance available for transfers and gas fees." />
      </div>

      <div className="flex items-end gap-2 py-2">
        <Typography variant="h2" fw="bold" className="!leading-none">
          {displayValue}
        </Typography>

        <Typography variant="h4" className="!leading-none pb-1">
          {symbol}
        </Typography>
      </div>
    </div>
  );
};

export default Balance;
