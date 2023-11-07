import { type FC } from 'react';
import {
  CopyWithTooltip,
  Typography,
  shortenHex,
} from '@webb-tools/webb-ui-components';

import { SectionWrapper } from './Wrapper';
import type { TxBasicInfoProps } from './types';
import { formatDateTimeByTimestamp } from '../../utils';

const TxBasicInfo: FC<TxBasicInfoProps> = ({
  amount,
  tokenSymbol,
  txHash,
  timestamp,
  relayerInfo,
}) => {
  return (
    <SectionWrapper>
      <TxBasicInfoItem label="Amount" value={`${amount} ${tokenSymbol}`} />

      {/* Relayer */}
      {relayerInfo && (
        <>
          <TxBasicInfoItem
            label="Relayer fee"
            value={`${relayerInfo.amount} ${relayerInfo.tokenSymbol}`}
          />
          <TxBasicInfoItem
            label="Relayer"
            value={
              <div className="flex items-center gap-1 !text-inherit">
                {relayerInfo.name}
                <CopyWithTooltip
                  textToCopy={relayerInfo.name}
                  isButton={false}
                  className="text-mono-160 dark:text-mono-80"
                />
              </div>
            }
          />
        </>
      )}

      <TxBasicInfoItem label="Tx hash" value={shortenHex(txHash, 5)} />
      <TxBasicInfoItem
        label="Time (UTC)"
        value={formatDateTimeByTimestamp(timestamp)}
      />
    </SectionWrapper>
  );
};

export default TxBasicInfo;

/** @internal */
const TxBasicInfoItem: FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => {
  return (
    <div className="flex items-center justify-between">
      <Typography variant="body1" fw="semibold">
        {label}
      </Typography>
      <Typography variant="body1" fw="semibold">
        {value}
      </Typography>
    </div>
  );
};
