import { LsProtocolId } from '@webb-tools/tangle-shared-ui/types/liquidStaking';
import { toSubstrateAddress } from '@webb-tools/webb-ui-components';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';

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
