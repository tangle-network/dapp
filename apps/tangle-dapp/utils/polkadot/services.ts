import { Option } from '@polkadot/types';
import { TanglePrimitivesJobsJobInfo } from '@polkadot/types/lookup';
import { BN } from '@polkadot/util';

import {
  TANGLE_TO_SERVICE_TYPE_TSS_MAP,
  TANGLE_TO_SERVICE_TYPE_ZK_SAAS_MAP,
} from '../../constants';
import { Service } from '../../types';

/**
 * Extracts service details from job information data.
 * @param id - The ID of the service.
 * @param jobInfoData - The job information data.
 * @returns The extracted service details or null if the job information data is empty or not phase 1 jobs
 */
export function extractServiceDetails(
  id: string,
  jobInfoData: Option<TanglePrimitivesJobsJobInfo>,
): Service | null {
  if (!jobInfoData.isSome) {
    return null;
  }

  const jobInfo = jobInfoData.unwrap();

  const jobType = jobInfo.jobType;

  if (jobType.isNone) {
    return null;
  }

  const expirationBlock = jobInfo.expiry;
  const ttlBlock = jobInfo.ttl;
  const fee = jobInfo.fee.toBn();

  // Check for TSS phase 1
  if (jobType.isDkgtssPhaseOne) {
    const jobDetails = jobType.asDkgtssPhaseOne;
    const participants = jobDetails.participants.map((participant) =>
      participant.toString(),
    );
    const permittedCaller = jobDetails.permittedCaller.isSome
      ? jobDetails.permittedCaller.unwrap().toString()
      : undefined;

    return {
      id,
      serviceType: TANGLE_TO_SERVICE_TYPE_TSS_MAP[jobDetails.roleType.type],
      participants,
      threshold: jobDetails.threshold.toNumber(),
      expirationBlock,
      ttlBlock,
      earnings: fee.div(new BN(participants.length)),
      permittedCaller,
    };
  }

  // Check for Zk-SaaS phase 1
  if (jobType.isZkSaaSPhaseOne) {
    const jobDetails = jobType.asZkSaaSPhaseOne;
    const participants = jobDetails.participants.map((participant) =>
      participant.toString(),
    );
    const permittedCaller = jobDetails.permittedCaller.isSome
      ? jobDetails.permittedCaller.unwrap().toString()
      : undefined;
    return {
      id,
      serviceType: TANGLE_TO_SERVICE_TYPE_ZK_SAAS_MAP[jobDetails.roleType.type],
      participants,
      expirationBlock,
      ttlBlock,
      earnings: fee.div(new BN(participants.length)),
      permittedCaller,
    };
  }

  // Not a phase 1 job
  return null;
}
