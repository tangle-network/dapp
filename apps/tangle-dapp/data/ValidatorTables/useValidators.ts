import { AccountId32 } from '@polkadot/types/interfaces';
import {
  PalletStakingStakingLedger,
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
  const { data: ledgers } = usePolkadotApiRx(
    useCallback((api) => api.query.staking.ledger.entries(), [])
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

  // Mapping Ledger
  const mappedLedgers = useMemo(() => {
    const map = new Map<string, PalletStakingStakingLedger>();
    ledgers?.forEach(([storageKey, ledger]) => {
      const accountId = storageKey.args[0].toString();
      map.set(accountId, ledger.unwrapOrDefault());
    });
    return map;
  }, [ledgers]);

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
      const totalStakeAmount = exposure?.total.unwrap() ?? BN_ZERO;
      const ledger = mappedLedgers.get(address.toString());

      const selfStakedAmount = ledger?.total.toBn() ?? BN_ZERO;
      const selfStakedBalance = formatTokenBalance(
        selfStakedAmount,
        nativeTokenSymbol
      );

      const nominators = nominations.filter(([, nominatorData]) => {
        if (nominatorData.isNone) {
          return false;
        }

        const nominations = nominatorData.unwrap();

        return (
          nominations.targets &&
          nominations.targets.some(
            (target) => target.toString() === address.toString()
          )
        );
      });

      const validatorPref = mappedValidatorPrefs.get(address.toString());
      const commissionRate = validatorPref?.commission.unwrap().toNumber() ?? 0;
      const commission = commissionRate / 10_000_000;

      return {
        address: address.toString(),
        identityName: name,
        selfStaked: selfStakedBalance,
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
    mappedLedgers,
    mappedValidatorPrefs,
    nativeTokenSymbol,
    status,
  ]);
};
