import { TanglePrimitivesTimeUnit } from '@polkadot/types/lookup';

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

export default getValueOfTangleTimeUnit;
