import { Alert } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { LsProtocolId } from '../../../constants/liquidStaking/types';
import useLsFeePercentage from './useLsFeePercentage';

// 10%.
const THRESHOLD_PERCENTAGE = 0.1;

export type LsFeeWarningProps = {
  isMinting: boolean;
  selectedProtocolId: LsProtocolId;
};

const LsFeeWarning: FC<LsFeeWarningProps> = ({ selectedProtocolId }) => {
  const fee = useLsFeePercentage(selectedProtocolId, true);

  return (
    typeof fee === 'number' &&
    fee >= THRESHOLD_PERCENTAGE && (
      <Alert
        type="warning"
        title="High fees"
        description="The fee for liquid staking this asset is higher than 10% of the amount."
      />
    )
  );
};

export default LsFeeWarning;
