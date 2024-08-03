import { SimpleTimeUnitInstance } from '../../constants/liquidStaking';

const stringifyTimeUnit = (timeUnit: SimpleTimeUnitInstance): string => {
  const plurality = timeUnit.value === 1 ? '' : 's';

  return `${timeUnit.value} ${timeUnit.unit}${plurality}`;
};

export default stringifyTimeUnit;
