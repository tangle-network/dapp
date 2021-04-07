import { Condition, Tooltip } from '@webb-dapp/ui-components';
import React, { FC, ReactNode } from 'react';

import { formatHash } from '../utils';

interface Props {
  hash: string;
  withCopy?: boolean;
  withTooltip?: boolean;
  withPScan?: boolean;
}

function getPScanUrl(hash: string): string {
  return `https://edgeware.subscan.io/extrinsic/${hash}`;
}

// @ts-ignore
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

  return renderInner();
};
