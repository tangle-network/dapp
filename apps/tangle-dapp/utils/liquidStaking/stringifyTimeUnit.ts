import { SimpleTimeUnitInstance } from '../../constants/liquidStaking';

const stringifyTimeUnit = (
  timeUnit: SimpleTimeUnitInstance,
): [number, string] => {
  const plurality = timeUnit.value === 1 ? '' : 's';

  return [timeUnit.value, `${timeUnit.unit}${plurality}`] as const;
};

export default stringifyTimeUnit;
