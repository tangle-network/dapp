import { BN, BN_TEN } from '@polkadot/util';

import { RestakingService, type Service } from '../../types';

export default function useActiveServices() {
  return {
    data: [
      {
        id: '123',
        serviceType: RestakingService.ZK_SAAS_GROTH16,
        participants: ['5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'],
        threshold: 3,
        earnings: BN_TEN,
        expirationBlock: new BN('456'),
        ttlBlock: new BN('456'),
      },
      {
        id: '124',
        serviceType: RestakingService.TSS_SILENT_SHARD_DKLS23SECP256K1,
        participants: ['5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'],
        earnings: BN_TEN,
        expirationBlock: new BN('456'),
        ttlBlock: new BN('456'),
      },
      {
        id: '125',
        serviceType: RestakingService.LIGHT_CLIENT_RELAYING,
        participants: ['5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'],
        expirationBlock: new BN('456'),
        ttlBlock: new BN('456'),
      },
      {
        id: '126',
        serviceType: RestakingService.ZK_SAAS_MARLIN,
        participants: ['5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'],
        threshold: 3,
        earnings: BN_TEN,
        expirationBlock: new BN('456'),
        ttlBlock: new BN('456'),
      },
      {
        id: '127',
        serviceType: RestakingService.LIGHT_CLIENT_RELAYING,
        participants: ['5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'],
        expirationBlock: new BN('456'),
        ttlBlock: new BN('456'),
      },
    ] satisfies Service[],
    isLoading: false,
  };
}
