import { BN } from '@polkadot/util';
import { FC, useMemo } from 'react';

import { EMPTY_VALUE_PLACEHOLDER } from '../../../constants';
import { LS_DERIVATIVE_TOKEN_PREFIX } from '../../../constants/liquidStaking/constants';
import { LsProtocolId } from '../../../constants/liquidStaking/types';
import useLsExchangeRate, {
  ExchangeRateType,
} from '../../../data/liquidStaking/useLsExchangeRate';
import formatBn from '../../../utils/formatBn';
import getLsProtocolDef from '../../../utils/liquidStaking/getLsProtocolDef';
import scaleAmountByPermill from '../../../utils/scaleAmountByPermill';
import DetailItem from './DetailItem';
import useLsFeePermill from './useLsFeePermill';

export type TotalDetailItemProps = {
  isMinting: boolean;
  inputAmount: BN | null;
  protocolId: LsProtocolId;
};

const TotalDetailItem: FC<TotalDetailItemProps> = ({
  isMinting,
  inputAmount,
  protocolId,
}) => {
  const feePermill = useLsFeePermill(protocolId, isMinting);

  const { exchangeRate } = useLsExchangeRate(
    isMinting
      ? ExchangeRateType.NativeToDerivative
      : ExchangeRateType.DerivativeToNative,
    protocolId,
  );

  const protocol = getLsProtocolDef(protocolId);

  const totalAmount = useMemo(() => {
    if (inputAmount === null || exchangeRate === null || feePermill === null) {
      return null;
    }
    // Propagate errors.
    else if (feePermill instanceof Error) {
      return feePermill;
    } else if (exchangeRate instanceof Error) {
      return exchangeRate;
    }

    const feeAmount = scaleAmountByPermill(inputAmount, feePermill);

    return isMinting
      ? inputAmount.muln(exchangeRate).sub(feeAmount)
      : inputAmount.divn(exchangeRate).sub(feeAmount);
  }, [exchangeRate, feePermill, inputAmount, isMinting]);

  const formattedTotalAmount = useMemo(() => {
    // Nothing to show if the input amount is not set.
    if (inputAmount === null) {
      return EMPTY_VALUE_PLACEHOLDER;
    }
    // Propagate error or loading state.
    else if (!(totalAmount instanceof BN)) {
      return totalAmount;
    }

    return formatBn(totalAmount, protocol.decimals, {
      includeCommas: true,
    });
  }, [inputAmount, totalAmount, protocol.decimals]);

  const token = isMinting
    ? `${LS_DERIVATIVE_TOKEN_PREFIX}${protocol.token}`
    : protocol.token;

  const value =
    typeof formattedTotalAmount === 'string'
      ? `${formattedTotalAmount} ${token}`
      : formattedTotalAmount;

  return (
    <DetailItem
      title="Total"
      tooltip="The final amount that you will receive. This includes fees."
      value={value}
    />
  );
};

export default TotalDetailItem;
