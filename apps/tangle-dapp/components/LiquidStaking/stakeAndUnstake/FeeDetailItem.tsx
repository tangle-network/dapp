import { BN, BN_ZERO } from '@polkadot/util';
import { FC, useMemo } from 'react';

import { LsProtocolId } from '../../../constants/liquidStaking/types';
import formatBn from '../../../utils/formatBn';
import getLsProtocolDef from '../../../utils/liquidStaking/getLsProtocolDef';
import scaleAmountByPermill from '../../../utils/scaleAmountByPermill';
import DetailItem from './DetailItem';
import useLsFeePermill from './useLsFeePermill';

export type FeeDetailItemProps = {
  isMinting: boolean;
  inputAmount: BN | null;
  protocolId: LsProtocolId;
};

const FeeDetailItem: FC<FeeDetailItemProps> = ({
  isMinting,
  inputAmount,
  protocolId,
}) => {
  const feePermill = useLsFeePermill(protocolId, isMinting);

  const protocol = getLsProtocolDef(protocolId);

  // TODO: Add liquifier fees, and select either parachain or liquifier fees based on the given protocol's id.

  const feeAmount = useMemo(() => {
    // Propagate error or loading state.
    if (typeof feePermill !== 'number') {
      return feePermill;
    }

    return scaleAmountByPermill(inputAmount ?? BN_ZERO, feePermill);
  }, [feePermill, inputAmount]);

  const formattedFeeAmount = useMemo(() => {
    // Propagate error or loading state.
    if (!(feeAmount instanceof BN)) {
      return feeAmount;
    }

    const formattedAmount = formatBn(feeAmount, protocol.decimals, {
      includeCommas: true,
    });

    return `${formattedAmount} ${protocol.token}`;
  }, [feeAmount, protocol.decimals, protocol.token]);

  const feeTitle =
    typeof feePermill !== 'number'
      ? 'Fee'
      : `Fee (${(feePermill * 100).toFixed(2)}%)`;

  return <DetailItem title={feeTitle} value={formattedFeeAmount} />;
};

export default FeeDetailItem;
