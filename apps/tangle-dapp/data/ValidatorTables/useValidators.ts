import type { Option } from '@polkadot/types';
import type { AccountId32 } from '@polkadot/types/interfaces';
import type {
  PalletStakingValidatorPrefs,
  TanglePrimitivesJobsJobInfo,
} from '@polkadot/types/lookup';
import { BN_ZERO } from '@polkadot/util';
import {
  DEFAULT_FLAGS_ELECTED,
  DEFAULT_FLAGS_WAITING,
} from '@webb-tools/dapp-config/constants/tangle';
import { useCallback, useMemo } from 'react';
import { map } from 'rxjs';

import useFormatNativeTokenAmount from '../../hooks/useFormatNativeTokenAmount';
import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import type { Validator } from '../../types';
import { getExposureMap } from '../../utils/getExposureMap';
import { getTotalRestakedFromRestakeRoleLedger } from '../../utils/polkadot/restake';
import useValidatorsPrefs from '../staking/useValidatorsPrefs';
import useValidatorIdentityNames from './useValidatorIdentityNames';

export const useValidators = (
  addresses: AccountId32[] | null,
  status: 'Active' | 'Waiting'
): Validator[] | null => {
  const formatNativeTokenSymbol = useFormatNativeTokenAmount();
  const { data: identityNames } = useValidatorIdentityNames();
  const { data: validatorPrefs } = useValidatorsPrefs();

  const { data: nominations } = usePolkadotApiRx(
    useCallback((api) => api.query.staking.nominators.entries(), [])
  );

  const { data: restakingLedgers } = usePolkadotApiRx(
    useCallback((api) => api.query.roles.ledger.entries(), [])
  );

  const { data: jobIdLookups } = usePolkadotApiRx(
    useCallback((api) => api.query.jobs.validatorJobIdLookup.entries(), [])
  );

  const { data: activeJobs } = usePolkadotApiRx(
    useCallback((api) => api.query.jobs.submittedJobs.entries(), [])
  );

  const { data: exposureMap } = usePolkadotApiRx(
    useCallback(
      (api) =>
        status === 'Active'
          ? api.derive.staking
              .electedInfo(DEFAULT_FLAGS_ELECTED)
              .pipe(map((derive) => getExposureMap(api, derive)))
          : api.derive.staking
              .waitingInfo(DEFAULT_FLAGS_WAITING)
              .pipe(map((derive) => getExposureMap(api, derive))),
      [status]
    )
  );

  // Mapping Validator Preferences
  const mappedValidatorPrefs = useMemo(() => {
    const map = new Map<string, PalletStakingValidatorPrefs>();
    validatorPrefs?.forEach(([storageKey, prefs]) => {
      const accountId = storageKey.args[0].toString();
      map.set(accountId, prefs);
    });
    return map;
  }, [validatorPrefs]);

  return useMemo(
    () => {
      if (
        addresses === null ||
        identityNames === null ||
        exposureMap === null ||
        restakingLedgers === null ||
        nominations === null ||
        validatorPrefs === null ||
        jobIdLookups === null ||
        activeJobs === null
      ) {
        return null;
      }

      return addresses.map((address) => {
        const name =
          identityNames.get(address.toString()) ?? address.toString();

        const { exposureMeta } = exposureMap[address.toString()] ?? {};

        const totalStakeAmount = exposureMeta
          ? exposureMeta.total.toBn()
          : BN_ZERO;

        const selfStakedAmount = exposureMeta
          ? exposureMeta.own.toBn()
          : BN_ZERO;

        const selfStakedBalance = formatNativeTokenSymbol(selfStakedAmount);

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
        const commissionRate =
          validatorPref?.commission.unwrap().toNumber() ?? 0;
        const commission = commissionRate / 10_000_000;

        const ledger = restakingLedgers.find(([, ledgerData]) => {
          if (ledgerData.isNone) return false;

          const ledger = ledgerData.unwrap();
          return address.toString() === ledger.stash.toString();
        })?.[1];

        const totalRestaked =
          ledger && ledger.isSome
            ? getTotalRestakedFromRestakeRoleLedger(ledger)
            : null;

        const idLookupsByAddress = jobIdLookups
          .filter(([account]) => {
            return account.args[0].toString() === address.toString();
          })
          .map(([, jobIdAndType]) => {
            return jobIdAndType.unwrap().toArray()[0][1].toString();
          });

        const activeServices = activeJobs
          .filter(([jobIdAndType]) => {
            const jobId = jobIdAndType.args[1];
            return idLookupsByAddress.includes(jobId.toString());
          })
          .filter(([, jobData]) => {
            // TODO: somehow jobData here has type Codec
            const jobType = (
              jobData as Option<TanglePrimitivesJobsJobInfo>
            ).unwrap().jobType;
            // services are only phase 1 jobs
            return jobType?.isDkgtssPhaseOne || jobType?.isZkSaaSPhaseOne;
          });

        return {
          address: address.toString(),
          identityName: name,
          activeServicesNum: activeServices.length,
          restaked: totalRestaked
            ? formatNativeTokenSymbol(totalRestaked)
            : '0',
          selfStaked: selfStakedBalance,
          effectiveAmountStaked: formatNativeTokenSymbol(totalStakeAmount),
          effectiveAmountStakedRaw: totalStakeAmount.toString(),
          delegations: nominators.length.toString(),
          commission: commission.toString(),
          status,
        };
      });
    },
    // prettier-ignore
    [addresses, identityNames, exposureMap, restakingLedgers, nominations, validatorPrefs, jobIdLookups, activeJobs, formatNativeTokenSymbol, mappedValidatorPrefs, status]
  );
};
