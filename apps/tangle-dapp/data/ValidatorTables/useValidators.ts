import { AccountId32 } from '@polkadot/types/interfaces';
import {
  PalletStakingValidatorPrefs,
  SpStakingExposure,
} from '@polkadot/types/lookup';
import { BN_ZERO } from '@polkadot/util';
import { useCallback, useMemo } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import { Validator } from '../../types';
import { formatTokenBalance } from '../../utils/polkadot';
import useCurrentEra from '../staking/useCurrentEra';
import useValidatorsPrefs from '../staking/useValidatorsPrefs';
import useValidatorIdentityNames from './useValidatorIdentityNames';

export const useValidators = (
  addresses: AccountId32[] | null,
  status: 'Active' | 'Waiting'
): Validator[] | null => {
  const { nativeTokenSymbol } = useNetworkStore();

  const { data: currentEra } = useCurrentEra();
  const { data: identityNames } = useValidatorIdentityNames();
  const { data: validatorPrefs } = useValidatorsPrefs();
  const { data: exposures } = usePolkadotApiRx(
    useCallback(
      (api) =>
        currentEra === null
          ? null
          : api.query.staking.erasStakers.entries(currentEra),
      [currentEra]
    )
  );
  const { data: nominations } = usePolkadotApiRx(
    useCallback((api) => api.query.staking.nominators.entries(), [])
  );

  // Mapping Exposures
  const mappedExposures = useMemo(() => {
    const map = new Map<string, SpStakingExposure>();
    exposures?.forEach(([storageKey, exposure]) => {
      const accountId = storageKey.args[1].toString();
      map.set(accountId, exposure);
    });
    return map;
  }, [exposures]);

  // Mapping Validator Preferences
  const mappedValidatorPrefs = useMemo(() => {
    const map = new Map<string, PalletStakingValidatorPrefs>();
    validatorPrefs?.forEach(([storageKey, prefs]) => {
      const accountId = storageKey.args[0].toString();
      map.set(accountId, prefs);
    });
    return map;
  }, [validatorPrefs]);

  return useMemo(() => {
    if (
      addresses === null ||
      identityNames === null ||
      exposures === null ||
      nominations === null ||
      validatorPrefs === null
    ) {
      return null;
    }

    return addresses.map((address) => {
      const name = identityNames.get(address.toString()) ?? address.toString();
      const exposure = mappedExposures.get(address.toString());
      const selfStakedAmount = exposure?.own.unwrap() ?? BN_ZERO;
      const totalStakeAmount = exposure?.total.unwrap() ?? BN_ZERO;

      const nominators = nominations.filter(([, nominatorData]) => {
        if (nominatorData.isNone) {
          return false;
        }

        const nominations = nominatorData.unwrap();

        return (
          nominations.targets &&
          nominations.targets.some((target) => target.eq(address))
        );
      });

      const validatorPref = mappedValidatorPrefs.get(address.toString());
      const commissionRate = validatorPref?.commission.unwrap().toNumber() ?? 0;
      const commission = commissionRate / 10_000_000;

      return {
        address: address.toString(),
        identityName: name,
        selfStaked: formatTokenBalance(selfStakedAmount, nativeTokenSymbol),
        effectiveAmountStaked: formatTokenBalance(
          totalStakeAmount,
          nativeTokenSymbol
        ),
        effectiveAmountStakedRaw: totalStakeAmount.toString(),
        delegations: nominators.length.toString(),
        commission: commission.toString(),
        status,
      };
    });
  }, [
    addresses,
    identityNames,
    exposures,
    nominations,
    validatorPrefs,
    mappedExposures,
    mappedValidatorPrefs,
    nativeTokenSymbol,
    status,
  ]);
};
