'use client';

import { BN } from '@polkadot/util';

import type { PieChartItem } from '../../../components/charts/types';
import { RestakingService } from '../../../types';
import getChartDataAreaColorByServiceType from '../../../utils/getChartDataAreaColorByServiceType';

export default function useRoleDistribution(): PieChartItem[] {
  const data = [
    { name: RestakingService.ZK_SAAS_GROTH16, value: new BN('400') },
    { name: RestakingService.ZK_SAAS_MARLIN, value: new BN('300') },
    { name: RestakingService.LIGHT_CLIENT_RELAYING, value: new BN('300') },
    {
      name: RestakingService.TSS_SILENT_SHARD_DKLS23SECP256K1,
      value: new BN('200'),
    },
  ];

  return data.map((role) => {
    return { ...role, color: getChartDataAreaColorByServiceType(role.name) };
  });
}
