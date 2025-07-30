import { FC } from 'react';
import { BN } from '@polkadot/util';
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
import {
  getCreditsNeededForMinimum,
  MINIMUM_CLAIMABLE_CREDITS,
} from '../../../utils/creditConstraints';

type Props = {
  currentAmount: BN | null | undefined;
  tokenSymbol?: string;
};

const CreditVelocityTooltip: FC<Props> = ({
  currentAmount,
  tokenSymbol = 'TNT',
}) => {
  const creditsNeeded = getCreditsNeededForMinimum(currentAmount);

  const formattedMinimum = formatDisplayAmount(
    MINIMUM_CLAIMABLE_CREDITS,
    TANGLE_TOKEN_DECIMALS,
    AmountFormatStyle.SHORT,
  );

  const formattedCreditsNeeded = formatDisplayAmount(
    creditsNeeded,
    TANGLE_TOKEN_DECIMALS,
    AmountFormatStyle.SHORT,
  );

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

        {!creditsNeeded.isZero() && (
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
