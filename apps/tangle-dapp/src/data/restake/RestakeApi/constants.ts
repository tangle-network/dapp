// Hardcoded value from

import { assertEvmAddress } from '@webb-tools/webb-ui-components';

// https://github.com/webb-tools/tangle/blob/050d607fe9fc663d69e545a8d55a17974039ed04/precompiles/multi-asset-delegation/MultiAssetDelegation.sol#L5C43-L5C85
export const MULTI_ASSET_DELEGATION_EVM_ADDRESS = assertEvmAddress(
  '0x0000000000000000000000000000000000000822',
);
