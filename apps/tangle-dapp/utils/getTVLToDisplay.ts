import { getRoundedAmountString } from '@webb-tools/webb-ui-components/utils/getRoundedAmountString';

export default function getTVLToDisplay(tvl: number) {
  if (Number.isNaN(tvl) || tvl === 0) return '--';

  return `$${getRoundedAmountString(tvl)}`;
}
