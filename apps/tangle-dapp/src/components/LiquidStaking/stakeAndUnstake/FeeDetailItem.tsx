import { BN, BN_ZERO } from '@polkadot/util';
import { LsProtocolId } from '@webb-tools/tangle-shared-ui/types/liquidStaking';
import {
  AmountFormatStyle,
  formatDisplayAmount,
} from '@webb-tools/webb-ui-components';
import { EMPTY_VALUE_PLACEHOLDER } from '@webb-tools/webb-ui-components/constants';
import { FC, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import formatFractional from '../../../utils/formatFractional';
import getLsProtocolDef from '../../../utils/liquidStaking/getLsProtocolDef';
import scaleAmountByPercentage from '../../../utils/scaleAmountByPercentage';
import DetailItem from './DetailItem';
import useLsFeePercentage from './useLsFeePercentage';

export type FeeDetailItemProps = {
  isStaking: boolean;
  inputAmount: BN | null;
  protocolId: LsProtocolId;
};

const FeeDetailItem: FC<FeeDetailItemProps> = ({
  isStaking,
  inputAmount,
  protocolId,
}) => {
  const feePercentage = useLsFeePercentage(protocolId, isStaking);

  const protocol = getLsProtocolDef(protocolId);

  const feeAmount = useMemo(() => {
    // Propagate error or loading state.
    if (typeof feePercentage !== 'number') {
      return feePercentage;
    }

    return scaleAmountByPercentage(inputAmount ?? BN_ZERO, feePercentage);
  }, [feePercentage, inputAmount]);

  const formattedFeeAmount = useMemo(() => {
    // Propagate error or loading state.
    if (!(feeAmount instanceof BN)) {
      return feeAmount;
    } else if (feeAmount.isZero()) {
      return EMPTY_VALUE_PLACEHOLDER;
    }

    const formattedAmount = formatDisplayAmount(
      feeAmount,
      protocol.decimals,
      AmountFormatStyle.EXACT,
    );

    return `${formattedAmount} ${protocol.token}`;
  }, [feeAmount, protocol.decimals, protocol.token]);

  const feeTitle =
    typeof feePercentage !== 'number'
      ? 'Fee'
      : `Fee (${formatFractional(feePercentage * 100)})`;

  return (
    <DetailItem
      title={feeTitle}
      value={formattedFeeAmount}
      className={twMerge(
        typeof feePercentage === 'number' &&
          feePercentage > 0.1 &&
          'text-yellow-500',
      )}
    />
  );
};

export default FeeDetailItem;
