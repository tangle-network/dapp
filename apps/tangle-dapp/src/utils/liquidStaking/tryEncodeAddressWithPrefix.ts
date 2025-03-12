import { LsProtocolId } from '@tangle-network/tangle-shared-ui/types/liquidStaking';
import { toSubstrateAddress } from '@tangle-network/ui-components';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';

const tryEncodeAddressWithPrefix = (
  address: SubstrateAddress,
  lsProtocolId: LsProtocolId,
): SubstrateAddress => {
  return tangleNetwork.ss58Prefix === undefined
    ? address
    : toSubstrateAddress(address, tangleNetwork.ss58Prefix);
};

export default tryEncodeAddressWithPrefix;
