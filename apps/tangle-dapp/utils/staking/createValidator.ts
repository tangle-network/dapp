import { Option, StorageKey, u64, Vec } from '@polkadot/types';
import {
  PalletRolesRestakingLedger,
  TanglePrimitivesJobsJobInfo,
  TanglePrimitivesRolesRoleType,
} from '@polkadot/types/lookup';
import { Codec, ITuple } from '@polkadot/types/types';
import { BN_ZERO } from '@polkadot/util';

import { Validator } from '../../types';
import { getTotalRestakedFromRestakeRoleLedger } from '../polkadot';
import createNominee, { CreateNomineeOptions } from './createNominee';

interface Options extends CreateNomineeOptions {
  restakingLedgers: Map<string, Option<PalletRolesRestakingLedger>>;
  jobs: Map<string, Option<Vec<ITuple<[TanglePrimitivesRolesRoleType, u64]>>>>;
  activeJobIds:
    | [StorageKey<[TanglePrimitivesRolesRoleType, u64]>, Codec][]
    | null;
}

const createValidator = (options: Options): Validator => {
  const nominator = createNominee(options);
  const allLedgers = Array.from(options.restakingLedgers.values());

  const ledger = allLedgers.find((ledgerOpt) => {
    if (ledgerOpt.isNone) {
      return false;
    }

    const ledger = ledgerOpt.unwrap();

    return options.address === ledger.stash.toString();
  });

  const totalRestaked =
    ledger !== undefined && ledger.isSome
      ? getTotalRestakedFromRestakeRoleLedger(ledger)
      : null;

  const jobs = options.jobs.get(options.address);

  const jobIds =
    jobs === undefined || jobs.isNone
      ? []
      : jobs.unwrap().map((jobIdAndType) => {
          // TODO: Avoid converting this to a string. Keep it as a BN, then use `.some()` to check if it's in the array down below, instead of `.includes()`.
          return jobIdAndType[1].toString();
        });

  const activeServices = options.activeJobIds
    ?.filter(([jobIdAndType]) => {
      const jobId = jobIdAndType.args[1];

      return jobIds.includes(jobId.toString());
    })
    .filter(([, jobData]) => {
      // TODO: somehow jobData here has type Codec
      const jobType = (jobData as Option<TanglePrimitivesJobsJobInfo>).unwrap()
        .jobType;
      // services are only phase 1 jobs
      return jobType?.isDkgtssPhaseOne || jobType?.isZkSaaSPhaseOne;
    });

  return {
    ...nominator,
    restakedAmount: totalRestaked ?? BN_ZERO,
    activeServicesCount: activeServices?.length ?? 0,
  };
};

export default createValidator;
