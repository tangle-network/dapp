'use client';

import { u128 } from '@polkadot/types';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';

import useNetworkStore from '../../context/useNetworkStore';
import useFormatReturnType from '../../hooks/useFormatReturnType';
import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';
import { Payout } from '../../types';
import {
  formatTokenBalance,
  getApiPromise,
  getApiRx,
  getValidatorCommission,
  getValidatorIdentity,
} from '../../utils/polkadot';

export default function usePayouts(
  address: string,
  defaultValue: { payouts: Payout[] } = {
    payouts: [],
  }
) {
  const {
    valueAfterMount: cachedPayouts,
    setWithPreviousValue: setCachedPayouts,
  } = useLocalStorage(LocalStorageKey.Payouts, true);

  const [payouts, setPayouts] = useState(
    (cachedPayouts && cachedPayouts[address]) ?? defaultValue.payouts
  );

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { rpcEndpoint, nativeTokenSymbol } = useNetworkStore();

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
        const apiSub = await getApiRx(rpcEndpoint);
        const apiPromise = await getApiPromise(rpcEndpoint);

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

            myNominations.forEach((validator) => {
              points.forEach((point) => {
                // regex to remove commas from the era number
                const era = Number(
                  point[0].toHuman()?.toString().replace(/,/g, '')
                );

                if (!era) {
                  return;
                }

                const rewards = point[1].toHuman();

                if (!rewards) {
                  return;
                }

                let validatorRewardPoints = 0;

                const totalRewardPoints = parseFloat(
                  rewards.total?.toString().replace(/,/g, '') ?? '0'
                );

                if (
                  typeof rewards.individual === 'object' &&
                  rewards.individual !== null
                ) {
                  Object.entries(rewards.individual).forEach(([key, value]) => {
                    if (key === validator.toString()) {
                      validatorRewardPoints = Number(value);
                    }
                  });
                }

                if (validatorRewardPoints > 0) {
                  allRewards.push({
                    era,
                    totalRewardPoints,
                    validator: validator.toString(),
                    validatorRewardPoints,
                  });
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

                  const validatorLedger = await apiPromise.query.staking.ledger(
                    validator
                  );

                  // TODO: For some reason, this can be `undefined`. Might be caused to the Substrate types being out of date? For now, default to an empty array.
                  const claimedRewards =
                    validatorLedger.unwrap().claimedRewards ?? [];

                  const claimedEras = claimedRewards.map((era) =>
                    Number(era.toString().replace(/,/g, ''))
                  );

                  if (claimedEras.includes(era)) {
                    return;
                  }

                  const erasTotalReward =
                    await apiPromise.query.staking.erasValidatorReward(era);

                  if (erasTotalReward.isNone) {
                    return;
                  }

                  const validatorTotalReward =
                    (validatorRewardPoints *
                      Number(erasTotalReward.unwrap().toString())) /
                    totalRewardPoints;

                  if (validatorTotalReward > 0) {
                    const validatorTotalRewardFormatted = formatTokenBalance(
                      new u128(
                        apiPromise.registry,
                        BigInt(Math.floor(validatorTotalReward))
                      ),
                      nativeTokenSymbol
                    );

                    const eraStaker =
                      await apiPromise.query.staking.erasStakers(
                        era,
                        validator
                      );

                    const validatorTotalStake = eraStaker.total.unwrap();

                    const validatorTotalStakeFormatted = formatTokenBalance(
                      validatorTotalStake,
                      nativeTokenSymbol
                    );

                    if (
                      Number(validatorTotalStake.toString()) > 0 &&
                      eraStaker.others.length > 0
                    ) {
                      const nominatorStakeInfo = eraStaker.others.find(
                        (nominator) => nominator.who.toString() === address
                      );

                      if (nominatorStakeInfo && !nominatorStakeInfo.isEmpty) {
                        const nominatorTotalStake =
                          nominatorStakeInfo.value.unwrap();

                        if (Number(nominatorTotalStake.toString()) > 0) {
                          const nominatorStakePercentage =
                            (Number(nominatorTotalStake.toString()) /
                              Number(validatorTotalStake.toString())) *
                            100;

                          const validatorCommissionPercentage =
                            await getValidatorCommission(
                              rpcEndpoint,
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
                            formatTokenBalance(
                              new u128(
                                apiPromise.registry,
                                BigInt(Math.floor(nominatorTotalReward))
                              ),
                              nativeTokenSymbol
                            );

                          const validatorIdentity = await getValidatorIdentity(
                            rpcEndpoint,
                            validator
                          );

                          const validatorNominators = await Promise.all(
                            eraStaker.others.map(async (nominator) => {
                              const nominatorIdentity =
                                await getValidatorIdentity(
                                  rpcEndpoint,
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
                              validatorTotalStake: validatorTotalStakeFormatted,
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
                })
                .filter(
                  (payout): payout is Promise<Payout> => payout !== undefined
                );
            });

            if (myNominations.length > 0 && isMounted) {
              const validatorPayouts = await Promise.all(
                validatorPayoutsPromises
              );

              const payoutsData = validatorPayouts
                .filter((payout) => payout !== undefined)
                .sort((a, b) => Number(a.era) - Number(b.era));

              setPayouts(payoutsData);
              setCachedPayouts((previous) => ({
                ...previous,
                [address]: payoutsData,
              }));
              setIsLoading(false);
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
  }, [address, rpcEndpoint, setCachedPayouts, nativeTokenSymbol]);

  return useFormatReturnType({
    isLoading,
    error,
    data: { payouts },
  });
}
