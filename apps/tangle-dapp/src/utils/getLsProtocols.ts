import { Network } from '@tangle-network/ui-components/constants/networks';
import { LsProtocolDef } from '../constants/liquidStaking/types';

const getLsProtocols = (network: Network): LsProtocolDef[] => {
  return [
    {
      networkId: network.id,
      name: network.name,
      chainIconFileName: 'tangle',
    },
  ];
};

export default getLsProtocols;
