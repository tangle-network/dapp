import { isEvmAddress, isTemplateBigInt } from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { RestakeAssetId } from '../types';

const assertRestakeAssetId = (possibleAssetId: string): RestakeAssetId => {
  assert(isEvmAddress(possibleAssetId) || isTemplateBigInt(possibleAssetId));

  return possibleAssetId as RestakeAssetId;
};

export default assertRestakeAssetId;
