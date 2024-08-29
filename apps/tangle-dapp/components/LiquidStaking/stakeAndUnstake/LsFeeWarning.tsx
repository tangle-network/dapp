import { FC } from 'react';
import { LsProtocolId } from '../../../constants/liquidStaking/types';
import useLsFeePermill from './useLsFeePermill';
import { Alert } from '@webb-tools/webb-ui-components';

// 10%.
const THRESHOLD_PERMILL = 0.1;

export type LsFeeWarningProps = {
  isMinting: boolean;
  selectedProtocolId: LsProtocolId;
};

const LsFeeWarning: FC<LsFeeWarningProps> = ({ selectedProtocolId }) => {
  const fee = useLsFeePermill(selectedProtocolId, true);

  return (
    typeof fee === 'number' &&
    fee >= THRESHOLD_PERMILL && (
      <Alert
        type="warning"
        title="High fees"
        description="The fee for liquid staking this asset is higher than 10% of the amount."
      />
    )
  );
};

export default LsFeeWarning;
