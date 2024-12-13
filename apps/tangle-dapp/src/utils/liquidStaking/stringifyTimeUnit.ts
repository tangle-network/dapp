import pluralize from '@webb-tools/webb-ui-components/utils/pluralize';

import { LsParachainSimpleTimeUnit } from '../../constants/liquidStaking/types';

const stringifyTimeUnit = (
  timeUnit: LsParachainSimpleTimeUnit,
): [number, string] => {
  const unitString = pluralize(timeUnit.unit, timeUnit.value !== 1);

  return [timeUnit.value, unitString] as const;
};

export default stringifyTimeUnit;
