import { BN } from '@polkadot/util';

const STAKING_COMMISSION_FACTOR = new BN(10_000_000);

const calculateCommission = (commissionRate: BN): number => {
  // TODO: Need to ensure that the conversion to number here will never fail.
  return commissionRate
    .muln(100)
    .div(STAKING_COMMISSION_FACTOR)
    .divn(100)
    .toNumber();
};

export default calculateCommission;
