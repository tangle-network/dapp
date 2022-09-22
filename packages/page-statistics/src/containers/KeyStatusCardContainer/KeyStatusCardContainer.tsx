import { KeyStatusCard } from '@webb-dapp/webb-ui-components/components/KeyStatusCard';
import { KeyStatusCardProps } from '@webb-dapp/webb-ui-components/components/KeyStatusCard/types';
import React, { FC, forwardRef, useMemo } from 'react';

import { KeyStatusCardContainerProps } from './types';

/**
 * The wrapper of UI component. Handle logic and mapping fields between backend API and component API
 */
export const KeyStatusCardContainer: FC<KeyStatusCardContainerProps> = ({ data, keyType }) => {
  const { title, titleInfo } = useMemo(
    () => ({
      title: keyType === 'current' ? 'Active Key' : 'Next Key',
      titleInfo:
        keyType === 'current'
          ? 'The public key of the DKG protocol that is currently active.'
          : 'The public key of the DKG protocol that will be active after the next authority set change.',
    }),
    [keyType]
  );

  const authorities = useMemo(
    () =>
      data.keyGenAuthorities.reduce((acc, cur) => {
        acc.add(cur);
        return acc;
      }, new Set() as KeyStatusCardProps['authorities']),
    [data.keyGenAuthorities]
  );

  return (
    <KeyStatusCard
      title={title}
      titleInfo={titleInfo}
      sessionNumber={Number(data.session)}
      keyType={keyType}
      keyVal={data.uncompressed}
      startTime={data.start}
      endTime={data.end}
      authorities={authorities}
      totalAuthorities={data.keyGenAuthorities.length}
      fullDetailUrl={`drawer/${data.id}`}
    />
  );
};
