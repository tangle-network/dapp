'use client';

import { useCallback, useMemo } from 'react';

import useApiRx from '../../hooks/useApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import { Validator } from '../../types/index';
import Optional from '../../utils/Optional';
import createValidator from '../../utils/staking/createValidator';
import useStakingExposures from '../staking/useStakingExposures';
import useValidatorPrefs from '../staking/useValidatorPrefs';
import useValidatorIdentityNames from '../ValidatorTables/useValidatorIdentityNames';

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

      return createValidator({
        address: nomineeAddress,
        isActive,
        identities,
        prefs,
        exposures,
      });
    });

    return new Optional(nominees);
  }, [exposures, identities, nominationInfoOpt, prefs, sessionValidators]);

  return nominees;
};

export default useNominations;
