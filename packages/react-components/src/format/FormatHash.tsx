import React, { FC, ReactNode } from 'react';

import { Copy, Tooltip, Condition } from '@webb-dapp/ui-components';

import { formatHash } from '../utils';

interface Props {
  hash: string;
  withCopy?: boolean;
  withTooltip?: boolean;
  withPScan?: boolean;
}

function getPScanUrl(hash: string): string {
  return `https://acala-testnet.subscan.io/extrinsic/${hash}`;
}

export const FormatHash: FC<Props> = ({ hash, withCopy = true, withPScan = true, withTooltip = true }) => {
  const renderInner = (): ReactNode => {
    return (
      <Tooltip placement='top' show={withTooltip} title={hash}>
        <span>
          <Condition condition={withPScan} or={formatHash(hash)}>
            <a href={getPScanUrl(hash)} rel='noopener noreferrer' target='_blank'>
              {formatHash(hash)}
            </a>
          </Condition>
        </span>
      </Tooltip>
    );
  };

  return <Copy display={`Copy ${formatHash(hash)} Success`} render={renderInner} text={hash} withCopy={withCopy} />;
};
