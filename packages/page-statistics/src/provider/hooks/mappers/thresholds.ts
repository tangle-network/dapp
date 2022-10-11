import {
  ThresholdValueElementFragment,
  ThresholdValueFragment,
  ThresholdVariant,
} from '@webb-dapp/page-statistics/generated/graphql';
type Threshold = Omit<ThresholdValueElementFragment, 'variant' | '__typename'>;
const DEF_THRESHOLD_ELEMENT: Threshold = {
  current: 0,
  next: 0,
  pending: 0,
};
export function thresholdMap(thresholds: ThresholdValueFragment): Record<ThresholdVariant, Threshold> {
  const map = {
    [ThresholdVariant.KyeGen]: { ...DEF_THRESHOLD_ELEMENT },
    [ThresholdVariant.Signature]: { ...DEF_THRESHOLD_ELEMENT },
    [ThresholdVariant.Proposer]: { ...DEF_THRESHOLD_ELEMENT },
  };
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
