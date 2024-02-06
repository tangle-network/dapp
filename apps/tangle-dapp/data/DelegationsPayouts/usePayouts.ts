'use client';

import { u128 } from '@polkadot/types';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';

import useFormatReturnType from '../../hooks/useFormatReturnType';
import { Payout } from '../../types';
import {
  formatTokenBalance,
  getPolkadotApiPromise,
  getPolkadotApiRx,
  getValidatorCommission,
  getValidatorIdentity,
} from '../../utils/polkadot';

export default function usePayouts(
  address: string,
  defaultValue: { payouts: Payout[] } = {
    payouts: [],
  }
) {
  const [payouts, setPayouts] = useState(defaultValue.payouts);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let sub: Subscription | null = null;

    const subscribeData = async () => {
      if (!address) {
        if (isMounted) {
          setPayouts([]);
          setIsLoading(false);
        }
        return;
      }

      try {
        const apiSub = await getPolkadotApiRx();
        const apiPromise = await getPolkadotApiPromise();

        if (!apiSub || !apiPromise) {
          throw WebbError.from(WebbErrorCodes.ApiNotReady);
        }

        setIsLoading(true);

        const nominations = await apiPromise.query.staking.nominators(address);
        const myNominations = nominations.isSome
          ? nominations.unwrap().targets
          : [];

        sub = apiSub.query.staking.erasRewardPoints
          .entries()
          .subscribe(async (points) => {
            const allRewards: {
              era: number;
              totalRewardPoints: number;
              validator: string;
              validatorRewardPoints: number;
            }[] = [];

            let validatorPayoutsPromises: Promise<Payout>[] = [];

            if (myNominations.length > 0) {
              myNominations.forEach((validator) => {
                points.forEach((point) => {
                  // regex to remove commas from the era number
                  const era = Number(
                    point[0].toHuman()?.toString().replace(/,/g, '')
                  );

                  if (era) {
                    const rewards = point[1].toHuman();

                    let validatorRewardPoints = 0;

                    if (rewards) {
                      const totalRewardPoints = parseFloat(
                        rewards.total?.toString().replace(/,/g, '') ?? '0'
                      );

                      if (
                        typeof rewards.individual === 'object' &&
                        rewards.individual !== null
                      ) {
                        Object.entries(rewards.individual).forEach(
                          ([key, value]) => {
                            if (key === validator.toString()) {
                              validatorRewardPoints = Number(value);
                            }
                          }
                        );
                      }

                      if (validatorRewardPoints > 0) {
                        allRewards.push({
                          era,
                          totalRewardPoints,
                          validator: validator.toString(),
                          validatorRewardPoints,
                        });
                      }
                    }
                  }
                });

                validatorPayoutsPromises = allRewards
                  .map(async (reward) => {
                    const {
                      era,
                      totalRewardPoints,
                      validator,
                      validatorRewardPoints,
                    } = reward;
                    const validatorLedger =
                      await apiPromise.query.staking.ledger(validator);

                    const claimedEras = validatorLedger
                      .unwrap()
                      .claimedRewards.map((era) =>
                        Number(era.toString().replace(/,/g, ''))
                      );

                    if (claimedEras.includes(era)) return;

                    const erasTotalReward =
                      await apiPromise.query.staking.erasValidatorReward(era);

                    if (erasTotalReward.isSome) {
                      const validatorTotalReward =
                        (validatorRewardPoints *
                          Number(erasTotalReward.unwrap().toString())) /
                        totalRewardPoints;

                      if (validatorTotalReward > 0) {
                        const validatorTotalRewardFormatted =
                          await formatTokenBalance(
                            new u128(
                              apiPromise.registry,
                              validatorTotalReward.toString()
                            )
                          );

                        const eraStaker =
                          await apiPromise.query.staking.erasStakers(
                            era,
                            validator
                          );

                        const validatorTotalStake = eraStaker.total.unwrap();

                        const validatorTotalStakeFormatted =
                          await formatTokenBalance(validatorTotalStake);

                        if (
                          Number(validatorTotalStake.toString()) > 0 &&
                          eraStaker.others.length > 0
                        ) {
                          const nominatorStakeInfo = eraStaker.others.find(
                            (nominator) => nominator.who.toString() === address
                          );

                          if (
                            nominatorStakeInfo &&
                            !nominatorStakeInfo.isEmpty
                          ) {
                            const nominatorTotalStake =
                              nominatorStakeInfo.value.unwrap();

                            if (Number(nominatorTotalStake.toString()) > 0) {
                              const nominatorStakePercentage =
                                (Number(nominatorTotalStake.toString()) /
                                  Number(validatorTotalStake.toString())) *
                                100;

                              const validatorCommissionPercentage =
                                await getValidatorCommission(
                                  validator.toString()
                                );

                              const validatorCommission =
                                validatorTotalReward *
                                (Number(validatorCommissionPercentage) / 100);

                              const distributableReward =
                                validatorTotalReward - validatorCommission;

                              const nominatorTotalReward =
                                (nominatorStakePercentage / 100) *
                                distributableReward;

                              const nominatorTotalRewardFormatted =
                                await formatTokenBalance(
                                  new u128(
                                    apiPromise.registry,
                                    Math.floor(nominatorTotalReward)
                                  )
                                );

                              const validatorIdentity =
                                await getValidatorIdentity(validator);

                              const validatorNominators = await Promise.all(
                                eraStaker.others.map(async (nominator) => {
                                  const nominatorIdentity =
                                    await getValidatorIdentity(
                                      nominator.who.toString()
                                    );

                                  return {
                                    address: nominator.who.toString(),
                                    identity: nominatorIdentity ?? '',
                                  };
                                })
                              );

                              if (
                                validatorTotalStakeFormatted &&
                                validatorTotalRewardFormatted &&
                                nominatorTotalRewardFormatted
                              ) {
                                return {
                                  era,
                                  validator: {
                                    address: validator,
                                    identity: validatorIdentity ?? '',
                                  },
                                  validatorTotalStake:
                                    validatorTotalStakeFormatted,
                                  nominators: validatorNominators,
                                  validatorTotalReward:
                                    validatorTotalRewardFormatted,
                                  nominatorTotalReward:
                                    nominatorTotalRewardFormatted,
                                  status: 'unclaimed',
                                };
                              }
                            }
                          }
                        }
                      }
                    }
                  })
                  .filter(
                    (payout): payout is Promise<Payout> => payout !== undefined
                  );
              });

              if (isMounted) {
                const validatorPayouts = await Promise.all(
                  validatorPayoutsPromises
                );

                setPayouts(
                  validatorPayouts
                    .filter((payout) => payout !== undefined)
                    .sort((a, b) => Number(a.era) - Number(b.era))
                );
                setIsLoading(false);
              }
            }
          });
      } catch (e) {
        if (isMounted) {
          setPayouts([]);
          setError(
            e instanceof Error ? e : WebbError.from(WebbErrorCodes.UnknownError)
          );
          setIsLoading(false);
        }
      }
    };

    subscribeData();

    return () => {
      isMounted = false;
      sub?.unsubscribe();
    };
  }, [address]);

  return useFormatReturnType({
    isLoading,
    error,
    data: { payouts },
  });
}
