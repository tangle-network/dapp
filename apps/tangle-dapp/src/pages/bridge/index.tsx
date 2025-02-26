import { FC } from 'react';

import BridgeContainer from '../../containers/bridge/BridgeContainer';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';

const Bridge: FC = () => {
  const { network } = useNetworkStore();

  return <BridgeContainer network={network} />;
};

export default Bridge;
