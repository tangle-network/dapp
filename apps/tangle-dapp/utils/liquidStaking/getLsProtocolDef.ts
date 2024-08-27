import assert from 'assert';

import { LS_PROTOCOLS } from '../../constants/liquidStaking/constants';
import {
  LsErc20TokenDef,
  LsParachainChainDef,
  LsParachainChainId,
  LsProtocolId,
} from '../../constants/liquidStaking/types';

type IdToDefMap<T extends LsProtocolId> = T extends LsParachainChainId
  ? LsParachainChainDef
  : LsErc20TokenDef;

const getLsProtocolDef = <T extends LsProtocolId>(id: T): IdToDefMap<T> => {
  const result = LS_PROTOCOLS.find((def) => def.id === id);

  assert(
    result !== undefined,
    `No protocol definition found for id: ${id} (did you forget to add a new entry to the list?)`,
  );

  return result as IdToDefMap<T>;
};

export default getLsProtocolDef;
