import { ApiPromise } from '@polkadot/api';
import { getInflationParams } from '@polkadot/apps-config';
import { BN, BN_MILLION } from '@polkadot/util';

// Source - https://github.com/polkadot-js/apps/blob/80759592b9f01996e67175e5dd4bdd89b58322ad/packages/react-hooks/src/useInflation.ts#L19C50-L19C50
export const calculateInflation = (
  api: ApiPromise,
  totalStaked: BN,
  totalIssuance: BN,
  numAuctions: BN,
) => {
  const {
    auctionAdjust,
    auctionMax,
    falloff,
    maxInflation,
    minInflation,
    stakeTarget,
  } = getInflationParams(api);

  const stakedFraction =
    totalStaked.isZero() || totalIssuance.isZero()
      ? 0
      : totalStaked.mul(BN_MILLION).div(totalIssuance).toNumber() /
        BN_MILLION.toNumber();

  // Ideal is less based on the actual auctions, see
  // https://github.com/paritytech/polkadot/blob/816cb64ea16102c6c79f6be2a917d832d98df757/runtime/kusama/src/lib.rs#L531
  const idealStake =
    stakeTarget - Math.min(auctionMax, numAuctions.toNumber()) * auctionAdjust;

  const idealInterest = maxInflation / idealStake;

  // inflation calculations, see
  // https://github.com/paritytech/substrate/blob/0ba251c9388452c879bfcca425ada66f1f9bc802/frame/staking/reward-fn/src/lib.rs#L28-L54
  const inflation =
    100 *
    (minInflation +
      (stakedFraction <= idealStake
        ? stakedFraction * (idealInterest - minInflation / idealStake)
        : (idealInterest * idealStake - minInflation) *
          Math.pow(2, (idealStake - stakedFraction) / falloff)));

  return {
    idealInterest,
    idealStake,
    inflation,
    stakedFraction,
    stakedReturn: stakedFraction ? inflation / stakedFraction : 0,
  };
};
