import assert from 'assert';

import { SimpleTimeUnitInstance } from '../../constants/liquidStaking';

const performTimeUnitOp = (
  operation: (a: number, b: number) => number,
  a: SimpleTimeUnitInstance,
  b: SimpleTimeUnitInstance,
): SimpleTimeUnitInstance => {
  assert(
    a.unit === b.unit,
    `Time units must be of the same type, otherwise operations are not possible; Received: ${a.unit} and ${b.unit}`,
  );

  return {
    unit: a.unit,
    value: operation(a.value, b.value),
  };
};

export default performTimeUnitOp;
