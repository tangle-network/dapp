import { isEvmAddress, isTemplateNumber } from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { RestakeAssetId } from '../types';

const assertRestakeAssetId = (possibleAssetId: string): RestakeAssetId => {
  assert(isEvmAddress(possibleAssetId) || isTemplateNumber(possibleAssetId));

  return possibleAssetId as RestakeAssetId;
};

export default assertRestakeAssetId;
