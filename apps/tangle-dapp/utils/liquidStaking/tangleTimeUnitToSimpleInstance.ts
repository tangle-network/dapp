import { TanglePrimitivesTimeUnit } from '@polkadot/types/lookup';

import { SimpleTimeUnitInstance } from '../../constants/liquidStaking';
import getValueOfTangleTimeUnit from './getValueOfTangleTimeUnit';

const tangleTimeUnitToSimpleInstance = (
  tangleTimeUnit: TanglePrimitivesTimeUnit,
): SimpleTimeUnitInstance => {
  return {
    unit: tangleTimeUnit.type,
    value: getValueOfTangleTimeUnit(tangleTimeUnit),
  };
};

export default tangleTimeUnitToSimpleInstance;
