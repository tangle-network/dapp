import { ChainIcon } from '@tangle-network/icons';
import { Typography } from '@tangle-network/ui-components';
import { FC } from 'react';

import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';

const LsActiveNetwork: FC = () => {
  const network = useNetworkStore((store) => store.network2);

  return (
    <div className="flex items-center justify-center gap-2">
      <ChainIcon size="lg" name="tangle" />

      <Typography variant="h5" fw="bold" className="dark:text-mono-40">
        {network?.name ?? 'Connecting'}
      </Typography>
    </div>
  );
};

export default LsActiveNetwork;
