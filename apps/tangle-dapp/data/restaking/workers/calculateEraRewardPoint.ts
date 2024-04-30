import { Option } from '@polkadot/types';
import {
  PalletStakingValidatorPrefs,
  SpStakingPagedExposureMetadata,
} from '@polkadot/types/lookup';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';

import convertRewardPointsToReward from '../../../utils/convertRewardPointsToReward';
import { getPolkadotApiPromise } from '../../../utils/polkadot';

export async function calculateEraRewardPoints(
  rpcUrl: string,
  era: number,
  validatorRewards: Array<[string, number]>
): Promise<bigint | null> {
  const api = await getPolkadotApiPromise(rpcUrl);

  let eraReward = ZERO_BIG_INT;

  for (const [accountId, rewardPoints] of validatorRewards) {
    const [optionalExposure, validatorPrefs] = await api.queryMulti<
      [Option<SpStakingPagedExposureMetadata>, PalletStakingValidatorPrefs]
    >([
      [api.query.staking.erasStakersOverview, era, accountId],
      [api.query.staking.erasValidatorPrefs, era, accountId],
    ]);

    if (optionalExposure.isNone || validatorPrefs.isEmpty) {
      return null;
    }

    const exposure = optionalExposure.unwrap();

    eraReward += convertRewardPointsToReward(
      rewardPoints,
      validatorPrefs.commission.unwrap().toNumber(),
      exposure.own.unwrap().toBigInt(),
      exposure.total.unwrap().toBigInt()
    );
  }

  return eraReward;
}
