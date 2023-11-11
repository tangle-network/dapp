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
  hash,
  amount,
  fungibleTokenSymbol,
  wrappableTokenSymbol,
  timestamp,
  relayerName,
  relayerFeeAmount,
}) => {
  return (
    <SectionWrapper>
      <TxBasicInfoItem
        label="Amount"
        value={`${amount} ${wrappableTokenSymbol ?? fungibleTokenSymbol}`}
      />

      {/* Relayer Fees */}
      {relayerFeeAmount && (
        <TxBasicInfoItem
          label="Relayer fee"
          value={`${relayerFeeAmount} ${fungibleTokenSymbol}`}
        />
      )}

      {/* Relayer Name */}
      {relayerName && (
        <TxBasicInfoItem
          label="Relayer"
          value={
            <div className="flex items-center gap-1 !text-inherit">
              {relayerName}
              <CopyWithTooltip
                textToCopy={relayerName}
                isButton={false}
                className="text-mono-160 dark:text-mono-80"
              />
            </div>
          }
        />
      )}

      <TxBasicInfoItem label="Tx hash" value={shortenHex(hash, 5)} />
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
