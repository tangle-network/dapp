import { EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/webb-ui-components/constants';
import { getRoundedAmountString } from '@tangle-network/webb-ui-components/utils/getRoundedAmountString';

export default function getTVLToDisplay(tvl: number | null | undefined) {
  if (tvl === null || tvl === undefined || tvl === 0)
    return EMPTY_VALUE_PLACEHOLDER;

  return `$${getRoundedAmountString(tvl)}`;
}
