import { BN } from '@polkadot/util';
import { z } from 'zod';
import { RestakingService } from '../../../types';
import { RestakingAllocationMap } from '../types';

export function filterAllocations(
  allocations: RestakingAllocationMap,
): [RestakingService, BN][] {
  return Object.entries(allocations).map(([serviceString, amount]) => {
    const service = z.nativeEnum(RestakingService).parse(serviceString);

    return [service, amount];
  });
}
