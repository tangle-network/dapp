import { InfoIconWithTooltip, Typography } from '@tangle-network/ui-components';
import { EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/ui-components/constants';
import { FC, useMemo } from 'react';
import { useAccount, useBalance, useChainId } from 'wagmi';
import { formatUnits } from 'viem';

const Balance: FC = () => {
  const { address } = useAccount();
  const chainId = useChainId();

  const { data: balance, isLoading } = useBalance({
    address,
  });

  const formattedBalance = useMemo(() => {
    if (!balance) return null;
    const formatted = formatUnits(balance.value, balance.decimals);
    const num = parseFloat(formatted);
    return num.toLocaleString(undefined, {
      maximumFractionDigits: 4,
      minimumFractionDigits: 0,
    });
  }, [balance]);

  // Get native token symbol based on chain
  const nativeSymbol = useMemo(() => {
    if (balance?.symbol) return balance.symbol;
    // Fallback based on chain ID
    switch (chainId) {
      case 31337: // Anvil Local
        return 'TNT';
      case 8453: // Base
      case 84532: // Base Sepolia
        return 'ETH';
      default:
        return 'ETH';
    }
  }, [balance?.symbol, chainId]);

  const left = isLoading
    ? EMPTY_VALUE_PLACEHOLDER
    : (formattedBalance ?? EMPTY_VALUE_PLACEHOLDER);
  const right = nativeSymbol;

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center gap-1 sm:mr-auto">
        <Typography variant="body1" className="text-mono-120 dark:text-mono-80">
          Transferable Balance
        </Typography>

        <InfoIconWithTooltip content="The amount that can be freely transferred to other accounts and that isn't subject to any locks." />
      </div>

      <div className="flex items-end gap-2 py-2">
        <Typography variant="h2" fw="bold" className="!leading-none">
          {left}
        </Typography>

        <Typography variant="h4" className="!leading-none pb-1 flex gap-2">
          {right}
        </Typography>
      </div>
    </div>
  );
};

export default Balance;
