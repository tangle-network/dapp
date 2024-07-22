import { TanglePrimitivesTimeUnit } from '@polkadot/types/lookup';
import assert from 'assert';

import { LiquidStakingTimeUnitInstance } from '../../constants/liquidStaking';

const getValueOfTangleTimeUnit = (
  tangleTimeUnit: TanglePrimitivesTimeUnit,
): number => {
  // Unfortunately, there doesn't seem to be a cleaner way of
  // going about this. This is a direct cause of the way that
  // Rust enums are generated to be used in TypeScript/JavaScript.
  if (tangleTimeUnit.isEra) {
    return tangleTimeUnit.asEra.toNumber();
  } else if (tangleTimeUnit.isHour) {
    return tangleTimeUnit.asHour.toNumber();
  } else if (tangleTimeUnit.isKblock) {
    return tangleTimeUnit.asKblock.toNumber();
  } else if (tangleTimeUnit.isSlashingSpan) {
    return tangleTimeUnit.asSlashingSpan.toNumber();
  } else if (tangleTimeUnit.isRound) {
    return tangleTimeUnit.asRound.toNumber();
  }

  throw new Error(
    `Unknown or unsupported time unit type: ${tangleTimeUnit.type} (was the Tangle Restaking Parachain updated?)`,
  );
};

const addTimeUnits = (
  a: TanglePrimitivesTimeUnit,
  b: TanglePrimitivesTimeUnit,
): LiquidStakingTimeUnitInstance => {
  assert(
    a.type === b.type,
    `Time units must be of the same type, otherwise the addition is not possible; Received: ${a.type} and ${b.type}`,
  );

  const valueOfA = getValueOfTangleTimeUnit(a);
  const valueOfB = getValueOfTangleTimeUnit(b);

  return {
    unit: a.type,
    value: valueOfA + valueOfB,
  };
};

export default addTimeUnits;
