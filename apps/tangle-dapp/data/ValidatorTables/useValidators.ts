import { AccountId32 } from '@polkadot/types/interfaces';
import { BN_ZERO } from '@polkadot/util';
import { useCallback, useMemo } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import useApiRx from '../../hooks/useApiRx';
import { Validator } from '../../types';
import { formatTokenBalance } from '../../utils/polkadot';
import useStakingExposures from '../staking/useStakingExposures';
import useValidatorPrefs from '../staking/useValidatorPrefs';
import useValidatorIdentityNames from './useValidatorIdentityNames';

export const useValidators = (
  addresses: AccountId32[] | null,
  status: 'Active' | 'Waiting'
): Validator[] | null => {
  const { nativeTokenSymbol } = useNetworkStore();
  const { result: identityNames } = useValidatorIdentityNames();
  const { result: validatorPrefs } = useValidatorPrefs();
  const { result: exposures } = useStakingExposures();

  const { result: nominationInfo } = useApiRx(
    useCallback((api) => api.query.staking.nominators.entries(), [])
  );

  return useMemo(() => {
    if (
      addresses === null ||
      identityNames === null ||
      exposures === null ||
      nominationInfo === null ||
      validatorPrefs === null ||
      exposures === null
    ) {
      return null;
    }

    return addresses.map((address) => {
      const name = identityNames.get(address.toString()) ?? address.toString();
      const exposureOpt = exposures.get(address.toString());
      const totalStakeAmount = exposureOpt?.total.unwrap() ?? BN_ZERO;
      const selfStakedAmount = exposureOpt?.own.toBn() ?? BN_ZERO;

      const selfStakedBalance = formatTokenBalance(
        selfStakedAmount,
        nativeTokenSymbol
      );

      const nominators = nominationInfo.filter(([, nominatorData]) => {
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

      const validatorPref = validatorPrefs.get(address.toString());
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
    nominationInfo,
    validatorPrefs,
    nativeTokenSymbol,
    status,
  ]);
};
