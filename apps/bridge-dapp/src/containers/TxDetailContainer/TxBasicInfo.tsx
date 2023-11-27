import { type FC, useCallback, useMemo } from 'react';
import {
  CopyWithTooltip,
  Typography,
  shortenHex,
} from '@webb-tools/webb-ui-components';
import { getExplorerURI } from '@webb-tools/api-provider-environment/transaction/utils';
import { chainsConfig } from '@webb-tools/dapp-config';
import { ExternalLinkIcon } from '@radix-ui/react-icons';

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
  refundTokenSymbol,
  refundRecipientAddress,
  destinationTypedChainId,
}) => {
  const blockExplorerUrl = useMemo(
    () => chainsConfig[destinationTypedChainId]?.blockExplorers?.default.url,
    [destinationTypedChainId]
  );

  const getAddressTypeValueComponent = useCallback(
    (hash: string, isTx?: boolean) => {
      return blockExplorerUrl ? (
        <ValueWithExternalLink
          value={shortenHex(hash, 5)}
          href={getExplorerURI(
            blockExplorerUrl,
            hash,
            isTx ? 'tx' : 'address',
            'web3'
          ).toString()}
        />
      ) : (
        <ValueWithCopyTooltip value={shortenHex(hash, 5)} copyText={hash} />
      );
    },
    [blockExplorerUrl]
  );

  return (
    <SectionWrapper>
      {/* Tx Hash */}
      <TxBasicInfoItem
        label="Tx hash"
        value={getAddressTypeValueComponent(hash, true)}
      />

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
        value={getAddressTypeValueComponent(recipientAddress)}
      />

      {/* Relayer Name */}
      {(relayerName || relayerUri) && (
        <TxBasicInfoItem
          label="Relayer"
          value={
            relayerUri ? (
              <ValueWithExternalLink
                value={relayerName ?? new URL(relayerUri).host}
                href={relayerUri}
              />
            ) : (
              <ValueWithCopyTooltip value={relayerName ?? ''} />
            )
          }
        />
      )}

      {/* Relayer Fees */}
      {relayerFeesAmount && (
        <TxBasicInfoItem
          label="Relayer fees"
          value={`${relayerFeesAmount} ${fungibleTokenSymbol}`}
        />
      )}

      {/* Refund Recipient */}
      {refundRecipientAddress && (
        <TxBasicInfoItem
          label="Refund Recipient"
          value={getAddressTypeValueComponent(refundRecipientAddress)}
        />
      )}

      {/* Refund Amount */}
      {refundAmount && refundTokenSymbol && (
        <TxBasicInfoItem
          label="Refund amount"
          value={`${refundAmount} ${refundTokenSymbol}`}
        />
      )}

      {/* Time */}
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

/** @internal */
const ValueWithExternalLink: FC<{ value: string; href: string }> = ({
  value,
  href,
}) => {
  return (
    <div className="flex items-center gap-1 !text-inherit">
      {value}
      <a href={href} target="_blank" rel="noopener noreferrer">
        <ExternalLinkIcon />
      </a>
    </div>
  );
};
