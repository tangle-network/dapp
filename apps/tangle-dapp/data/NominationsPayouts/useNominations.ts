'use client';

import { useCallback, useMemo } from 'react';

import useApiRx from '../../hooks/useApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import { Nominee } from '../../types/index';
import Optional from '../../utils/Optional';
import createNominee from '../../utils/staking/createNominee';
import useStakingExposures from '../staking/useStakingExposures';
import useValidatorPrefs from '../staking/useValidatorPrefs';
import useValidatorIdentityNames from '../ValidatorTables/useValidatorIdentityNames';

const useNominations = () => {
  const activeSubstrateAddress = useSubstrateAddress();
  const { result: identities } = useValidatorIdentityNames();
  const { result: prefs } = useValidatorPrefs();
  const { result: exposures } = useStakingExposures();

  const { result: sessionValidators } = useApiRx(
    useCallback((api) => api.query.session.validators(), []),
  );

  const { result: nominationInfoOpt } = useApiRx(
    useCallback(
      (api) => {
        if (activeSubstrateAddress === null) {
          return null;
        }

        return api.query.staking.nominators(activeSubstrateAddress);
      },
      [activeSubstrateAddress],
    ),
  );

  const nominees = useMemo<Optional<Nominee[]> | null>(() => {
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

      // TODO: Turn this into a set, and then use `has` instead of `some`.
      const isActive = sessionValidators.some(
        (validatorAddress) => validatorAddress.toString() === nomineeAddress,
      );

      return createNominee({
        address: nomineeAddress,
        isActive,
        identities,
        prefs,
        getExposure: (address) => {
          const exposureOpt = exposures.get(address);

          if (exposureOpt === undefined || exposureOpt.isNone) {
            return undefined;
          }

          const exposure = exposureOpt.unwrap();

          return {
            own: exposure.own.toBn(),
            total: exposure.total.toBn(),
            nominatorCount: exposure.nominatorCount.toNumber(),
          };
        },
      });
    });

    return new Optional(nominees);
  }, [exposures, identities, nominationInfoOpt, prefs, sessionValidators]);

  return nominees;
};

export default useNominations;
