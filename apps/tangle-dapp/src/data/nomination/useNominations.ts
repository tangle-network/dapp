import useApiRx from '@tangle-network/tangle-shared-ui/hooks/useApiRx';
import useSubstrateAddress from '@tangle-network/tangle-shared-ui/hooks/useSubstrateAddress';
import { Validator } from '@tangle-network/tangle-shared-ui/types';
import Optional from '@tangle-network/tangle-shared-ui/utils/Optional';
import assertSubstrateAddress from '@tangle-network/ui-components/utils/assertSubstrateAddress';
import { useCallback, useMemo } from 'react';
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
      const nomineeAddress = assertSubstrateAddress(
        nomineeAccountId.toString(),
      );

      // TODO: Turn this into a set, and then use `has` instead of `some`.
      const isActive = sessionValidators
        .map((address) => assertSubstrateAddress(address.toString()))
        .some((validatorAddress) => validatorAddress === nomineeAddress);

      return createValidator({
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
