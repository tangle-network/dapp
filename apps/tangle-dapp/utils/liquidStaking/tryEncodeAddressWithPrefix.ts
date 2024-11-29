import { LsProtocolId } from '@webb-tools/tangle-shared-ui/types/liquidStaking';
import { SubstrateAddress } from '@webb-tools/tangle-shared-ui/types/utils';
import toSubstrateAddress from '@webb-tools/tangle-shared-ui/utils/toSubstrateAddress';

import getLsProtocolDef from './getLsProtocolDef';
import getLsTangleNetwork from './getLsTangleNetwork';

const tryEncodeAddressWithPrefix = (
  address: SubstrateAddress,
  lsProtocolId: LsProtocolId,
): SubstrateAddress => {
  const lsProtocol = getLsProtocolDef(lsProtocolId);
  const tangleNetwork = getLsTangleNetwork(lsProtocol.networkId);

  return tangleNetwork.ss58Prefix === undefined
    ? address
    : toSubstrateAddress(address, tangleNetwork.ss58Prefix);
};

export default tryEncodeAddressWithPrefix;
