import { BlockNumber, Percent } from '@polkadot/types/interfaces';
import { BN, BN_ZERO } from '@polkadot/util';
import { BigNumber } from 'bignumber.js';

const calculatePropotionalApy = (
  totalDeposited: BN,
  depositCap: BN,
  vaultApy: Percent,
) => {
  if (depositCap.isZero()) {
    return null;
  }

  const propotion = new BigNumber(totalDeposited.toString()).div(
    depositCap.toString(),
  );

  const proportionalApy = propotion.multipliedBy(
    new BigNumber(vaultApy.toString()).div(100),
  );

  return proportionalApy;
};

const calculateDecayFactor = (
  currentBlockNumber: BlockNumber | null,
  userLastClaimedBlockNumber: BN | null,
  decayStartPeriod: BN | null,
  decayRate: Percent | null,
) => {
  if (currentBlockNumber === null || userLastClaimedBlockNumber === null) {
    return new BigNumber(1);
  }

  if (decayStartPeriod === null || decayRate === null) {
    return new BigNumber(1);
  }

  const blockPassed = currentBlockNumber.sub(userLastClaimedBlockNumber);

  // If we haven't reached the decay period yet, no decay
  if (blockPassed.lte(decayStartPeriod)) {
    return new BigNumber(1);
  }

  const decayPercent = new BigNumber(100).minus(decayRate.toNumber());
  return decayPercent.div(100);
};

const calculateVaultAnnualRewards = (
  depositCap: BN,
  apy: Percent,
  totalSupply: BN | null,
  totalVaultDeposited: BN,
  currentBlockNumber: BlockNumber | null,
  userLastClaimedBlockNumber: BN | null,
  decayStartPeriod: BN | null,
  decayRate: Percent | null,
) => {
  const proportionalApy = calculatePropotionalApy(
    totalVaultDeposited,
    depositCap,
    apy,
  );

  if (proportionalApy === null) {
    return null;
  }

  if (totalSupply === null) {
    return null;
  }

  // Calculate the total annual rewards
  const totalAnnualRewards = proportionalApy.multipliedBy(
    totalSupply.toString(),
  );

  const decayFactor = calculateDecayFactor(
    currentBlockNumber,
    userLastClaimedBlockNumber,
    decayStartPeriod,
    decayRate,
  );

  const annualRewards = totalAnnualRewards.multipliedBy(decayFactor);
  if (annualRewards.isZero()) {
    return BN_ZERO;
  }

  return new BN(annualRewards.integerValue().toString(10));
};

export default calculateVaultAnnualRewards;
