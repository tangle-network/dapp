import { TanglePrimitivesTimeUnit } from '@polkadot/types/lookup';

import { LsParachainSimpleTimeUnit } from '../../constants/liquidStaking/types';
import getValueOfTangleTimeUnit from './getValueOfTangleTimeUnit';

const tangleTimeUnitToSimpleInstance = (
  tangleTimeUnit: TanglePrimitivesTimeUnit,
): LsParachainSimpleTimeUnit => {
  return {
    unit: tangleTimeUnit.type,
    value: getValueOfTangleTimeUnit(tangleTimeUnit),
  };
};

export default tangleTimeUnitToSimpleInstance;
