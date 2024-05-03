import assert from 'assert';

import { RestakingService } from '../types';

export default function assertRestakingService(
  name: string
): asserts name is RestakingService {
  assert(
    Object.values(RestakingService).includes(name as RestakingService),
    `Invalid RestakingService: ${name}`
  );
}
