import { TanglePrimitivesTimeUnit } from '@polkadot/types/lookup';

import { LsSimpleParachainTimeUnit } from '../../constants/liquidStaking/types';
import getValueOfTangleTimeUnit from './getValueOfTangleTimeUnit';

const tangleTimeUnitToSimpleInstance = (
  tangleTimeUnit: TanglePrimitivesTimeUnit,
): LsSimpleParachainTimeUnit => {
  return {
    unit: tangleTimeUnit.type,
    value: getValueOfTangleTimeUnit(tangleTimeUnit),
  };
};

export default tangleTimeUnitToSimpleInstance;
