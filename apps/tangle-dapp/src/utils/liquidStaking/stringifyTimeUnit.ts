import { LsParachainSimpleTimeUnit } from '../../constants/liquidStaking/types';
import pluralize from '../pluralize';

const stringifyTimeUnit = (
  timeUnit: LsParachainSimpleTimeUnit,
): [number, string] => {
  const unitString = pluralize(timeUnit.unit, timeUnit.value !== 1);

  return [timeUnit.value, unitString] as const;
};

export default stringifyTimeUnit;
