// This will override global types and provide type definitions for
// Tangle Restaking Parachain for this file only.
import '@webb-tools/tangle-restaking-types';

import { TanglePrimitivesCurrencyCurrencyId } from '@polkadot/types/lookup';

import { ParachainCurrency } from '../../constants/liquidStaking';

const getValueOfTangleCurrency = (
  tangleCurrencyId: TanglePrimitivesCurrencyCurrencyId,
): ParachainCurrency => {
  switch (tangleCurrencyId.type) {
    case 'Native':
      return tangleCurrencyId.asNative.type;
    case 'Token':
      return tangleCurrencyId.asToken.type;
    case 'Stable':
      return tangleCurrencyId.asStable.type;
    case 'VsToken':
      return tangleCurrencyId.asVsToken.type;
    // TODO: Implement missing cases.
    default:
      throw new Error(
        `Unknown or unsupported currency type: ${tangleCurrencyId} (was the Tangle Restaking Parachain updated?)`,
      );
  }
};

export default getValueOfTangleCurrency;
