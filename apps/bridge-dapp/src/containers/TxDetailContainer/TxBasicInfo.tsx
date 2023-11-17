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
  recipientAddress,
  fungibleTokenSymbol,
  wrapTokenSymbol,
  unwrapTokenSymbol,
  timestamp,
  relayerUri,
  relayerName,
  relayerFeesAmount,
  refundAmount,
  refundRecipientAddress,
  refundTokenSymbol,
}) => {
  return (
    <SectionWrapper>
      {/* Tx Amount */}
      <TxBasicInfoItem
        label="Amount"
        value={`${amount} ${
          wrapTokenSymbol ?? unwrapTokenSymbol ?? fungibleTokenSymbol
        }`}
      />

      {/* Recipient */}
      <TxBasicInfoItem
        label="Recipient"
        value={
          <ValueWithCopyTooltip
            value={shortenHex(recipientAddress, 5)}
            copyText={recipientAddress}
          />
        }
      />

      {/* Relayer Fees */}
      {relayerFeesAmount && (
        <TxBasicInfoItem
          label="Relayer fee"
          value={`${relayerFeesAmount} ${fungibleTokenSymbol}`}
        />
      )}

      {/* Relayer Name */}
      {relayerName && (
        <TxBasicInfoItem
          label="Relayer"
          value={<ValueWithCopyTooltip value={relayerName} />}
        />
      )}

      {/* Refund Recipient */}

      {/* Refund Amount */}

      <TxBasicInfoItem
        label="Tx hash"
        value={
          <ValueWithCopyTooltip value={shortenHex(hash, 5)} copyText={hash} />
        }
      />
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

/** @internal */
const ValueWithCopyTooltip: FC<{ value: string; copyText?: string }> = ({
  value,
  copyText,
}) => {
  return (
    <div className="flex items-center gap-1 !text-inherit">
      {value}
      <CopyWithTooltip
        textToCopy={copyText ?? value}
        isButton={false}
        className="text-mono-160 dark:text-mono-80"
      />
    </div>
  );
};
