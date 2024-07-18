// This will override global types and provide type definitions for
// Tangle Restaking Parachain for this file only.
import '@webb-tools/tangle-restaking-types';

import { TanglePrimitivesCurrencyCurrencyId } from '@polkadot/types/lookup';

import { LiquidStakingCurrency } from '../../constants/liquidStaking';

const getValueOfTangleCurrency = (
  tangleCurrencyId: TanglePrimitivesCurrencyCurrencyId,
): LiquidStakingCurrency => {
  // TODO: Implement.
  // Unfortunately, there doesn't seem to be a cleaner way of
  // going about this. This is a direct cause of the way that
  // Rust enums are generated to be used in TypeScript/JavaScript.
  // if (tangleCurrencyId.isNative) {
  //   return tangleCurrencyId.asNative.type;
  // } else if (tangleCurrencyId.isToken) {
  //   return tangleCurrencyId.asToken.type;
  // } else if (tangleCurrencyId.isToken2) {
  //   return tangleCurrencyId.asToken2.type;
  // } else if (tangleCurrencyId.isLstToken) {
  //   return tangleCurrencyId.asLst.type;
  // } else if (tangleCurrencyId.isLst2) {
  //   return tangleCurrencyId.asLst2.type;
  // } else if (tangleCurrencyId.isStable) {
  //   return tangleCurrencyId.asStable.type;
  // } else if (tangleCurrencyId.isVsToken) {
  //   return tangleCurrencyId.asVsToken.type;
  // } else if (tangleCurrencyId.isVsToken2) {
  //   return tangleCurrencyId.asVsToken2.type;
  // } else if (tangleCurrencyId.isVsBond) {
  //   return tangleCurrencyId.asVsBond.type;
  // } else if (tangleCurrencyId.isVsBond2) {
  //   return tangleCurrencyId.asVsBond2.type;
  // } else if (tangleCurrencyId.isLpToken) {
  //   return tangleCurrencyId.asLpToken.type;
  // } else if (tangleCurrencyId.isForeignAsset) {
  //   return tangleCurrencyId.asForeignAsset.type;
  // } else if (tangleCurrencyId.isStableLpToken) {
  //   return tangleCurrencyId.asStableLpToken.type;
  // } else if (tangleCurrencyId.isBlp) {
  //   return tangleCurrencyId.asBlp.type;
  // } else if (tangleCurrencyId.isLend) {
  //   return tangleCurrencyId.asLend.type;
  // }

  throw new Error(
    `Unknown or unsupported currency type: ${tangleCurrencyId} (was the Tangle Restaking Parachain updated?)`,
  );
};

export default getValueOfTangleCurrency;
