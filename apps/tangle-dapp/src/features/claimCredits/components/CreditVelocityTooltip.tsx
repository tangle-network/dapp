import { FC, useMemo } from 'react';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import {
  Tooltip,
  TooltipBody,
  TooltipTrigger,
} from '@tangle-network/ui-components';
import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config';
import {
  formatDisplayAmount,
  AmountFormatStyle,
} from '@tangle-network/ui-components';
import { BN } from '@polkadot/util';
import {
  getCreditsNeededForMinimum,
  MINIMUM_CLAIMABLE_CREDITS,
} from '../../../utils/creditConstraints';

type Props = {
  currentAmount: bigint | null | undefined;
  tokenSymbol?: string;
};

const CreditVelocityTooltip: FC<Props> = ({
  currentAmount,
  tokenSymbol = 'TNT',
}) => {
  const creditsNeeded = useMemo(
    () => getCreditsNeededForMinimum(currentAmount),
    [currentAmount],
  );

  // Convert decimal values to token units (multiply by 10^decimals) for BN
  const formattedMinimum = formatDisplayAmount(
    new BN(
      BigInt(
        Math.round(MINIMUM_CLAIMABLE_CREDITS * 10 ** TANGLE_TOKEN_DECIMALS),
      ).toString(),
    ),
    TANGLE_TOKEN_DECIMALS,
    AmountFormatStyle.SHORT,
  );

  // Format creditsNeeded to avoid floating-point display artifacts
  const formattedCreditsNeeded = useMemo(() => {
    if (creditsNeeded === 0) {
      return '0';
    }
    // Format to max 4 decimal places, removing trailing zeros
    return creditsNeeded.toFixed(4).replace(/\.?0+$/, '');
  }, [creditsNeeded]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <InfoCircledIcon className="w-4 h-4 text-mono-120 dark:text-mono-80 cursor-help" />
      </TooltipTrigger>

      <TooltipBody className="max-w-xs p-3 space-y-2">
        <Typography variant="body2" fw="bold">
          Minimum Claim Requirement
        </Typography>

        <Typography variant="body2" className="text-mono-120 dark:text-mono-80">
          You need at least {formattedMinimum} {tokenSymbol} to claim credits.
        </Typography>

        {creditsNeeded !== 0 && (
          <Typography
            variant="body2"
            className="text-mono-120 dark:text-mono-80"
          >
            You need {formattedCreditsNeeded} {tokenSymbol} more to reach the
            minimum.
          </Typography>
        )}
      </TooltipBody>
    </Tooltip>
  );
};

export default CreditVelocityTooltip;
