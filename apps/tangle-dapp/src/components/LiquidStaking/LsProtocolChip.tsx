import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import {
  EMPTY_VALUE_PLACEHOLDER,
  Typography,
} from '@tangle-network/ui-components';
import { FC } from 'react';

const LsProtocolChip: FC = () => {
  const networkTokenSymbol = useNetworkStore(
    (store) => store.network2?.tokenSymbol,
  );

  return (
    <div className="flex items-center justify-center gap-2 rounded-lg">
      <LsTokenIcon name="tnt" />

      <Typography variant="h5" fw="bold">
        {networkTokenSymbol ?? EMPTY_VALUE_PLACEHOLDER}
      </Typography>
    </div>
  );
};

export default LsProtocolChip;
