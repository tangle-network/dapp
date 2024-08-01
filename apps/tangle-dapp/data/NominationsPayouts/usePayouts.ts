'use client';

import type { Option, u128 } from '@polkadot/types';
import {
  PalletStakingValidatorPrefs,
  SpStakingExposurePage,
  SpStakingPagedExposureMetadata,
} from '@polkadot/types/lookup';
import { BN_ZERO } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { useCallback, useEffect, useMemo } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import useApiRx from '../../hooks/useApiRx';
import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import { Payout } from '../../types';
import { getApiPromise as getPolkadotApiPromise } from '../../utils/polkadot';
import useEraTotalRewards from '../payouts/useEraTotalRewards';
import useNominationsUnclaimedRewards from '../payouts/useNominationsUnclaimedRewards';
import { usePayoutsStore } from '../payouts/usePayoutsStore';
import { ValidatorReward } from '../types';
import useValidatorIdentityNames from '../ValidatorTables/useValidatorIdentityNames';

type UsePayoutsReturnType = {
  isLoading: boolean;
  data: {
    [maxEras: number]: Payout[];
  };
};

export default function usePayouts(): UsePayoutsReturnType {
  const { activeAccount } = useWebContext();

  const setIsLoading = usePayoutsStore((state) => state.setIsLoading);
  const setPayouts = usePayoutsStore((state) => state.setPayouts);
  const resetPayouts = usePayoutsStore((state) => state.resetPayouts);
  const isLoading = usePayoutsStore((state) => state.isLoading);
  const data = usePayoutsStore((state) => state.data);
  const maxEras = usePayoutsStore((state) => state.eraRange);

  const { setWithPreviousValue: setCachedPayouts } = useLocalStorage(
    LocalStorageKey.PAYOUTS,
    true,
  );

  const { rpcEndpoint, network } = useNetworkStore();
  const activeSubstrateAddress = useSubstrateAddress();

  const { data: eraTotalRewards } = useEraTotalRewards();
  const { result: validatorIdentityNamesMap } = useValidatorIdentityNames();

  const unclaimedRewards = useNominationsUnclaimedRewards();

  const { result: validators } = useApiRx(
    useCallback((api) => api.query.staking.validators.entries(), []),
  );

  const mappedValidatorInfo = useMemo(() => {
    const map = new Map<string, PalletStakingValidatorPrefs>();

    validators?.forEach(([storageKey, validatorInfo]) => {
      map.set(storageKey.args[0].toString(), validatorInfo);
    });

    return map;
  }, [validators]);

  // Reset payouts when the active account changes or when the user is not connected
  useEffect(() => {
    resetPayouts();
  }, [activeAccount?.address, resetPayouts, setPayouts]);

  // Keep this check outside to prevent cycle by the `data` dependency.
  const doesDataAtMaxErasExist =
    data[maxEras] !== undefined && data[maxEras].length > 0;

  useEffect(
    () => {
      // Make sure all data is available before computing payouts.
      if (
        activeSubstrateAddress === null ||
        unclaimedRewards.length === 0 ||
        eraTotalRewards === null ||
        eraTotalRewards.size === 0 ||
        mappedValidatorInfo.size === 0 ||
        validatorIdentityNamesMap === null ||
        validatorIdentityNamesMap.size === 0 ||
        doesDataAtMaxErasExist
      ) {
        return;
      }

      const abortController = new AbortController();

      const computePayouts = async () => {
        try {
          setIsLoading(true);

          const payouts = await fetchPayouts(
            rpcEndpoint,
            activeSubstrateAddress,
            unclaimedRewards,
            eraTotalRewards,
            mappedValidatorInfo,
            validatorIdentityNamesMap,
            network.ss58Prefix,
            abortController.signal,
          );

          abortController.signal.throwIfAborted();

          const sortedPayout = payouts.sort((a, b) => a.era - b.era);

          abortController.signal.throwIfAborted();
          setPayouts({ [maxEras]: sortedPayout });
          setCachedPayouts((previous) => ({
            ...previous?.value,
            [rpcEndpoint]: {
              ...previous?.value?.[rpcEndpoint],
              [activeSubstrateAddress]: sortedPayout,
            },
          }));
        } catch (error) {
          // Ignore if it is the AbortError
          if ((error as Error).name === 'AbortError') {
            setIsLoading(false);
            return;
          }

          console.error('[usePayouts] Error fetching payouts', error);
        } finally {
          setIsLoading(false);
        }
      };

      computePayouts();

      return () => {
        abortController.abort();
      };
    },
    // prettier-ignore
    [activeSubstrateAddress, doesDataAtMaxErasExist, eraTotalRewards, mappedValidatorInfo, maxEras, network.ss58Prefix, rpcEndpoint, setCachedPayouts, setIsLoading, setPayouts, unclaimedRewards, validatorIdentityNamesMap],
  );

  return {
    isLoading,
    data,
  };
}

const fetchPayouts = async (
  rpcEndpoint: string,
  activeSubstrateAddress: string,
  unclaimedRewards: ValidatorReward[],
  eraTotalRewards: Map<number, Option<u128>>,
  mappedValidatorInfo: Map<string, PalletStakingValidatorPrefs>,
  validatorIdentityNamesMap: Map<string, string | null>,
  ss58Prefix?: number,
  abortSignal?: AbortSignal,
): Promise<Payout[]> => {
  const publicKey = decodeAddress(activeSubstrateAddress);
  const activeSubstrateAddressEncoded = encodeAddress(publicKey, ss58Prefix);
  const apiPromise = await getPolkadotApiPromise(rpcEndpoint);

  abortSignal?.throwIfAborted();

  const payoutsWithNull = await Promise.all(
    unclaimedRewards.map(async (reward) => {
      const eraTotalRewardOpt = eraTotalRewards.get(reward.era);

      if (eraTotalRewardOpt === undefined || eraTotalRewardOpt.isNone) {
        return null;
      }

      const eraTotalRewardOptValue = eraTotalRewardOpt.unwrap();

      const validatorTotalReward = eraTotalRewardOptValue
        .toBn()
        .muln(reward.validatorRewardPoints)
        .divn(reward.eraTotalRewardPoints);

      if (validatorTotalReward.isZero()) {
        return null;
      }

      abortSignal?.throwIfAborted();

      const erasStakersOverview =
        await apiPromise.query.staking.erasStakersOverview<
          Option<SpStakingPagedExposureMetadata>
        >(reward.era, reward.validatorAddress);

      const validatorTotalStake = !erasStakersOverview.isNone
        ? erasStakersOverview.unwrap().total.toBn()
        : BN_ZERO;

      const validatorNominatorCount = !erasStakersOverview.isNone
        ? erasStakersOverview.unwrap().nominatorCount.toNumber()
        : 0;

      if (validatorTotalStake.isZero() || validatorNominatorCount === 0) {
        return null;
      }

      abortSignal?.throwIfAborted();

      const eraStakerPaged = await apiPromise.query.staking.erasStakersPaged<
        Option<SpStakingExposurePage>
      >(reward.era, reward.validatorAddress, 0);

      if (eraStakerPaged.isNone) {
        return null;
      }

      const individualExposures = eraStakerPaged.unwrap().others;

      const nominatorStakeInfo = individualExposures.find(
        (nominator) =>
          nominator.who.toString() === activeSubstrateAddressEncoded,
      );

      if (nominatorStakeInfo === undefined || nominatorStakeInfo.isEmpty) {
        return null;
      }

      const nominatorTotalStake = nominatorStakeInfo.value.unwrap();

      if (nominatorTotalStake.isZero()) {
        return null;
      }

      const validatorInfo = mappedValidatorInfo.get(reward.validatorAddress);

      if (validatorInfo === undefined) {
        return null;
      }

      const validatorIdentityName =
        validatorIdentityNamesMap.get(reward.validatorAddress) ?? '';

      const validatorNominators = individualExposures.map((nominator) => {
        const nominatorIdentity =
          validatorIdentityNamesMap.get(nominator.who.toString()) ?? '';

        return {
          address: nominator.who.toString(),
          identity: nominatorIdentity,
        };
      });

      abortSignal?.throwIfAborted();

      const stakerEraReward = await apiPromise.derive.staking.stakerRewards(
        activeSubstrateAddressEncoded,
      );

      const stakerEraRewardsEra = stakerEraReward.find(
        (_reward) => _reward.era.toNumber() === reward.era,
      );

      let nominatorTotalReward = BN_ZERO;

      if (stakerEraRewardsEra) {
        if (stakerEraRewardsEra.validators[reward.validatorAddress]) {
          nominatorTotalReward =
            stakerEraRewardsEra.validators[reward.validatorAddress].value ??
            BN_ZERO;
        }
      }

      // TODO: Isn't this check redundant? The type of each is never null or undefined. Is it checking for zero? If so, should be using `isZero()` instead.
      if (validatorTotalStake && validatorTotalReward && nominatorTotalReward) {
        const payout: Payout = {
          era: reward.era,
          validator: {
            address: reward.validatorAddress,
            identity: validatorIdentityName,
          },
          validatorTotalStake: validatorTotalStake,
          nominators: validatorNominators,
          validatorTotalReward: validatorTotalReward,
          nominatorTotalReward: nominatorTotalReward,
          nominatorTotalRewardRaw: nominatorTotalReward,
        };

        return payout;
      }

      return null;
    }),
  );

  return payoutsWithNull.filter((payout): payout is Payout => payout !== null);
};
