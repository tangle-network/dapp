'use client';

import useEraCountSubscription from '../../data/HeaderChips/useEraCountSubscription';
import getRoundedDownNumberWith2Decimals from '../../utils/getRoundedDownNumberWith2Decimals';

export default function ChipValueClient(props: { value?: number }) {
  const era = useEraCountSubscription(props.value);

  return <>{getRoundedDownNumberWith2Decimals(era)}</>;
}
