// This will override global types and provide type definitions for
// Tangle Restaking Parachain for this file only.
import '@webb-tools/tangle-restaking-types';

import { TanglePrimitivesCurrencyCurrencyId } from '@polkadot/types/lookup';
import { capitalize } from 'lodash';

import { ParachainCurrency } from '../../constants/liquidStaking';

const getValueOfTangleCurrency = (
  tangleCurrencyId: TanglePrimitivesCurrencyCurrencyId,
): ParachainCurrency => {
  let result: ParachainCurrency;

  switch (tangleCurrencyId.type) {
    case 'Native':
      result = tangleCurrencyId.asNative.type;

      break;
    case 'Token':
      result = tangleCurrencyId.asToken.type;

      break;
    case 'Stable':
      result = tangleCurrencyId.asStable.type;

      break;
    case 'VsToken':
      result = tangleCurrencyId.asVsToken.type;

      break;
    // TODO: Implement missing cases.
    default:
      throw new Error(
        `Unknown or unsupported currency type: ${tangleCurrencyId} (was the Tangle Restaking Parachain updated?)`,
      );
  }

  // TODO: For some reason, there's a mismatch between the type definitions and the actual values. The actual returned values are all uppercase, while the type definitions report it as being capitalized (ex. 'DOT' vs 'Dot'). This is a temporary fix until the type definitions are updated.
  return capitalize(result) as ParachainCurrency;
};

export default getValueOfTangleCurrency;
