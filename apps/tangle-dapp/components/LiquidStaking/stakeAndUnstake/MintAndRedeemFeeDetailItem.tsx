import { BN, BN_ZERO } from '@polkadot/util';
import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config';
import { SkeletonLoader } from '@webb-tools/webb-ui-components';
import { FC, useMemo } from 'react';

import { EMPTY_VALUE_PLACEHOLDER } from '../../../constants';
import { LiquidStakingToken } from '../../../constants/liquidStaking';
import useMintAndRedeemFees from '../../../data/liquidStaking/useMintAndRedeemFees';
import formatBn from '../../../utils/formatBn';
import scaleAmountByPermill from '../../../utils/scaleAmountByPermill';
import DetailItem from './DetailItem';

export type MintAndRedeemFeeDetailItemProps = {
  isMinting: boolean;
  intendedAmount: BN | null;
  token: LiquidStakingToken;
};

const MintAndRedeemFeeDetailItem: FC<MintAndRedeemFeeDetailItemProps> = ({
  isMinting,
  intendedAmount,
  token,
}) => {
  const { result: fees } = useMintAndRedeemFees();
  const fee = fees === null ? null : isMinting ? fees.mintFee : fees.redeemFee;

  const feeAmount = useMemo(() => {
    if (fee === null) {
      return null;
    }

    return scaleAmountByPermill(intendedAmount ?? BN_ZERO, fee);
  }, [fee, intendedAmount]);

  const formattedFeeAmount = useMemo(() => {
    if (fee === null) {
      return EMPTY_VALUE_PLACEHOLDER;
    } else if (feeAmount === null) {
      return null;
    }

    // TODO: What token is charged as fee? The same as the intended token? TNT? Depending on which one it is, use its corresponding decimals.
    return formatBn(feeAmount, TANGLE_TOKEN_DECIMALS);
  }, [fee, feeAmount]);

  const value =
    formattedFeeAmount === null ? (
      <SkeletonLoader className="max-w-[80px]" />
    ) : (
      `${formattedFeeAmount} ${token}`
    );

  const feeTitle = fee === null ? 'Fee' : `Fee (${(fee * 100).toFixed(2)}%)`;

  return <DetailItem title={feeTitle} value={value} />;
};

export default MintAndRedeemFeeDetailItem;
