import { TanglePrimitivesRolesRoleType } from '@polkadot/types/lookup';

import { TANGLE_TO_SERVICE_TYPE_TSS_MAP } from '../../constants';
import { RestakingService } from '../../types';

function substrateRoleToServiceType(
  role: TanglePrimitivesRolesRoleType
): RestakingService {
  let serviceType: RestakingService | null = null;

  if (role.isZkSaaS) {
    const zksassRole = role.asZkSaaS;

    if (zksassRole.isZkSaaSGroth16) {
      serviceType = RestakingService.ZK_SAAS_GROTH16;
    } else if (zksassRole.isZkSaaSMarlin) {
      serviceType = RestakingService.ZK_SAAS_MARLIN;
    }
  } else if (role.isTss) {
    serviceType = TANGLE_TO_SERVICE_TYPE_TSS_MAP[role.asTss.type];
  } else if (role.isLightClientRelaying) {
    serviceType = RestakingService.LIGHT_CLIENT_RELAYING;
  }

  // Because of the structure of the provided types (not being an enum),
  // an error needs to be thrown in case no service mapping was found.
  // This is not ideal compared to using a switch statement which would
  // provide exhaustive static type checking.
  if (serviceType === null) {
    throw new Error(
      'Unknown role type (was a new role added? if so, update this function)'
    );
  }

  return serviceType;
}

export default substrateRoleToServiceType;
