import { BN, BN_ZERO } from '@polkadot/util';
import { FC, useMemo } from 'react';

import { EMPTY_VALUE_PLACEHOLDER } from '../../../constants';
import { LsProtocolId } from '../../../constants/liquidStaking/types';
import formatBn from '../../../utils/formatBn';
import formatPercentage from '../../../utils/formatPercentage';
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

    const formattedAmount = formatBn(feeAmount, protocol.decimals, {
      includeCommas: true,
    });

    return `${formattedAmount} ${protocol.token}`;
  }, [feeAmount, protocol.decimals, protocol.token]);

  const feeTitle =
    typeof feePercentage !== 'number'
      ? 'Fee'
      : `Fee (${formatPercentage(feePercentage * 100)})`;

  return <DetailItem title={feeTitle} value={formattedFeeAmount} />;
};

export default FeeDetailItem;
