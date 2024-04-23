import { BN_TEN } from '@polkadot/util';

import { RestakingService, type Service } from '../../types';

export default async function getActiveServices(): Promise<Service[]> {
  return [
    {
      id: '123',
      serviceType: RestakingService.ZK_SAAS_GROTH16,
      participants: 2,
      threshold: 3,
      earnings: BN_TEN,
      expirationBlock: '456',
    },
    {
      id: '124',
      serviceType: RestakingService.TSS_SILENT_SHARD_DKLS23SECP256K1,
      participants: 1,
      earnings: BN_TEN,
      expirationBlock: '456',
    },
    {
      id: '125',
      serviceType: RestakingService.LIGHT_CLIENT_RELAYING,
      participants: 2,
      expirationBlock: '456',
    },
    {
      id: '126',
      serviceType: RestakingService.ZK_SAAS_MARLIN,
      participants: 12,
      threshold: 3,
      earnings: BN_TEN,
      expirationBlock: '456',
    },
    {
      id: '127',
      serviceType: RestakingService.LIGHT_CLIENT_RELAYING,
      participants: 9,
      expirationBlock: '456',
    },
  ];
}
