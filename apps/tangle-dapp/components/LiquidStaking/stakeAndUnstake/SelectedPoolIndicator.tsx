import { Typography } from '@webb-tools/webb-ui-components';
import { FC, useMemo } from 'react';

import useLsPools from '../../../data/liquidStaking/useLsPools';
import { useLsStore } from '../../../data/liquidStaking/useLsStore';
import getLsProtocolDef from '../../../utils/liquidStaking/getLsProtocolDef';
import LsTokenIcon from '../../LsTokenIcon';

const SelectedPoolIndicator: FC = () => {
  const { selectedPoolId, selectedProtocolId } = useLsStore();
  const lsPools = useLsPools();
  const selectedProtocol = getLsProtocolDef(selectedProtocolId);

  const selectedPool = useMemo(() => {
    if (!(lsPools instanceof Map) || selectedPoolId === null) {
      return null;
    }

    return lsPools.get(selectedPoolId) ?? null;
  }, [lsPools, selectedPoolId]);

  return (
    <div className="group flex gap-2 justify-center items-center bg-mono-40 dark:bg-mono-170 px-4 py-2 rounded-lg">
      <LsTokenIcon name={selectedProtocol.token} />

      {selectedPool === null ? (
        <Typography variant="h5" fw="bold">
          Select a pool
        </Typography>
      ) : (
        <Typography variant="h5" fw="bold">
          {selectedPool.metadata}#{selectedPool.id}
        </Typography>
      )}
    </div>
  );
};

export default SelectedPoolIndicator;
