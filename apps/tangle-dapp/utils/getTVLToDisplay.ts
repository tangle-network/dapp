import { getRoundedAmountString } from '@webb-tools/webb-ui-components/utils/getRoundedAmountString';

import { EMPTY_VALUE_PLACEHOLDER } from '../constants';

export default function getTVLToDisplay(tvl: number | null | undefined) {
  if (tvl === null || tvl === undefined || tvl === 0)
    return EMPTY_VALUE_PLACEHOLDER;

  return `$${getRoundedAmountString(tvl)}`;
}
