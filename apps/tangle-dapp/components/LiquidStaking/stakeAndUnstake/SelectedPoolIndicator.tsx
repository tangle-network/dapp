import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { useLsStore } from '../../../data/liquidStaking/useLsStore';
import useSelectedPoolDisplayName from '../../../data/liquidStaking/useSelectedPoolDisplayName';
import getLsProtocolDef from '../../../utils/liquidStaking/getLsProtocolDef';
import LsTokenIcon from '../../LsTokenIcon';

const SelectedPoolIndicator: FC = () => {
  const { selectedProtocolId } = useLsStore();
  const selectedProtocol = getLsProtocolDef(selectedProtocolId);
  const selectedPoolDisplayName = useSelectedPoolDisplayName();

  return (
    <div className="group flex gap-2 justify-center items-center bg-mono-40 dark:bg-mono-170 px-4 py-2 rounded-lg">
      <LsTokenIcon name={selectedProtocol.token} />

      <Typography variant="h5" fw="bold" className="whitespace-nowrap">
        {selectedPoolDisplayName === null
          ? 'Select a pool'
          : selectedPoolDisplayName}
      </Typography>
    </div>
  );
};

export default SelectedPoolIndicator;
