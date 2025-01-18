import assert from 'assert';
import { RestakeAssetId } from './createRestakeAssetId';
import { isEvmAddress, isTemplateNumber } from '@webb-tools/webb-ui-components';

const assertRestakeAssetId = (possibleAssetId: string): RestakeAssetId => {
  assert(isEvmAddress(possibleAssetId) || isTemplateNumber(possibleAssetId));

  return possibleAssetId as RestakeAssetId;
};

export default assertRestakeAssetId;
