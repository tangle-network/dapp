import { formatDistance } from 'date-fns/formatDistance';

export enum CrossChainTimeUnit {
  DAY,
  LIVEPEER_ROUND,
  POLYGON_CHECKPOINT,
  MOONBEAM_ROUND,
  POLKADOT_ERA,
  ASTAR_ERA,
  TANGLE_RESTAKING_PARACHAIN_ERA,
}

/**
 * A static map containing the equivalent time value in
 * days of a given time unit.
 */
export const TIME_UNIT_CONVERSION_RATIOS: Record<CrossChainTimeUnit, number> = {
  [CrossChainTimeUnit.DAY]: 1,
  [CrossChainTimeUnit.LIVEPEER_ROUND]: 0.88,
  [CrossChainTimeUnit.POLYGON_CHECKPOINT]: 0.037,
  [CrossChainTimeUnit.ASTAR_ERA]: 1,
  [CrossChainTimeUnit.MOONBEAM_ROUND]: 0.25,
  // TODO: Tangle Restaking Parachain is a special case.
  [CrossChainTimeUnit.TANGLE_RESTAKING_PARACHAIN_ERA]: 0,
  [CrossChainTimeUnit.POLKADOT_ERA]: 1,
};

class CrossChainTime<T extends CrossChainTimeUnit> {
  public readonly unit: T;
  public readonly value: number;

  constructor(unit: T, value: number) {
    this.unit = unit;
    this.value = value;
  }

  to<U extends CrossChainTimeUnit>(unit: U): CrossChainTime<U> {
    return new CrossChainTime(
      unit,
      this.toDays() / TIME_UNIT_CONVERSION_RATIOS[unit],
    );
  }

  toDays(): number {
    return this.value * TIME_UNIT_CONVERSION_RATIOS[this.unit];
  }

  /**
   * Return a human readable time left until reaching this cross-chain
   * time.
   */
  toDistanceString(): string {
    const now = Date.now();
    const futureDate = new Date(now + this.toDays() * 24 * 60 * 60 * 1000);

    return formatDistance(futureDate, now, { addSuffix: true });
  }
}

export default CrossChainTime;
