import { LsProtocolId } from '@tangle-network/tangle-shared-ui/types/liquidStaking';
import assert from 'assert';

import { LS_PROTOCOLS } from '../../constants/liquidStaking/constants';
import {
  LsTangleNetworkDef,
  LsTangleNetworkId,
} from '../../constants/liquidStaking/types';

type IdToDefMap<T extends LsProtocolId> = T extends LsTangleNetworkId
  ? LsTangleNetworkDef
  : never;

const getLsProtocolDef = <T extends LsProtocolId>(id: T): IdToDefMap<T> => {
  const result = LS_PROTOCOLS.find((def) => def.id === id);

  assert(
    result !== undefined,
    `No protocol definition found for id: ${id} (did you forget to add a new entry to the list?)`,
  );

  return result as IdToDefMap<T>;
};

export default getLsProtocolDef;
