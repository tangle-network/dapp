'use client';

import { BN, BN_ZERO } from '@polkadot/util';
import { useCallback, useMemo } from 'react';

import useApiRx from '../../hooks/useApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import Optional from '../../utils/Optional';
import useStakingExposures from '../staking/useStakingExposures';
import useValidatorPrefs from '../staking/useValidatorPrefs';
import useValidatorIdentityNames from '../ValidatorTables/useValidatorIdentityNames';

export type Validator = {
  address: string;
  isActive: boolean;
  identityName: string;
  commission: BN;
  selfStakeAmount: BN;
  totalStakeAmount: BN;
  nominatorCount: number;
};

const useNominations = () => {
  const activeSubstrateAddress = useSubstrateAddress();
  const { result: identities } = useValidatorIdentityNames();
  const { result: prefs } = useValidatorPrefs();
  const { result: exposures } = useStakingExposures();

  const { result: sessionValidators } = useApiRx(
    useCallback((api) => api.query.session.validators(), [])
  );

  const { result: nominationInfoOpt } = useApiRx(
    useCallback(
      (api) => {
        if (activeSubstrateAddress === null) {
          return null;
        }

        return api.query.staking.nominators(activeSubstrateAddress);
      },
      [activeSubstrateAddress]
    )
  );

  const nominees = useMemo<Optional<Validator[]> | null>(() => {
    if (
      nominationInfoOpt === null ||
      sessionValidators === null ||
      identities === null ||
      prefs === null ||
      exposures === null
    ) {
      return null;
    } else if (nominationInfoOpt.isNone) {
      return new Optional();
    }

    const nomineeAccountIds = nominationInfoOpt.unwrap().targets;

    const nominees = nomineeAccountIds.map((nomineeAccountId) => {
      const nomineeAddress = nomineeAccountId.toString();

      const isActive = sessionValidators.some(
        (validatorAddress) => validatorAddress.toString() === nomineeAddress
      );

      const identityName = identities.get(nomineeAddress) ?? nomineeAddress;

      // TODO: Will it ever be unset if the nominee is a validator?
      const commission =
        prefs.get(nomineeAddress)?.commission.toBn() ?? BN_ZERO;

      // TODO: Will it ever be unset if the nominee is a validator?
      const exposure = exposures.get(nomineeAddress)?.value ?? null;

      const selfStakeAmount = exposure?.own.toBn() ?? BN_ZERO;
      const totalStakeAmount = exposure?.total.toBn() ?? BN_ZERO;

      // TODO: Will it ever be unset if the nominee is a validator?
      const nominatorCount = exposure?.nominatorCount.toNumber() ?? 0;

      return {
        address: nomineeAddress,
        isActive,
        identityName,
        commission,
        selfStakeAmount,
        totalStakeAmount,
        nominatorCount,
      };
    });

    return new Optional(nominees);
  }, [exposures, identities, nominationInfoOpt, prefs, sessionValidators]);

  return nominees;
};

export default useNominations;
