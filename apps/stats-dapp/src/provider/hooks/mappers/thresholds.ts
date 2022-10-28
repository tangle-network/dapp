import {
  ThresholdValueElementFragment,
  ThresholdValueFragment,
  ThresholdVariant,
} from '../../../generated/graphql';
type Threshold = Omit<ThresholdValueElementFragment, 'variant' | '__typename'>;

export function thresholdMap(thresholds: ThresholdValueFragment): Partial<Record<ThresholdVariant, Threshold>> {
  const map: Partial<Record<ThresholdVariant, Threshold>> = {};
  thresholds.nodes
    .filter((i) => Boolean(i))
    .forEach((element) => {
      const threshold = element!;
      map[threshold.variant] = {
        pending: threshold.pending,
        next: threshold.pending,
        current: threshold.pending,
      };
    });
  return map;
}

export function thresholdVariant(thresholds: ThresholdValueFragment, variant: ThresholdVariant) {
  const valid = thresholds.nodes.filter((t) => t && t.variant === variant);
  if (variant.length === 0) {
    return null;
  }
  return valid[0];
}
