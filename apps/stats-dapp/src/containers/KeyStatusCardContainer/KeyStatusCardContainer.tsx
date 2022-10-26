import { KeyStatusCard } from '@nepoche/webb-ui-components/components/KeyStatusCard';
import { KeyStatusCardProps } from '@nepoche/webb-ui-components/components/KeyStatusCard/types';
import { Spinner } from '@nepoche/webb-ui-components/icons';
import React, { FC, forwardRef, useMemo } from 'react';

import { KeyStatusCardContainerProps } from './types';

/**
 * The wrapper of UI component. Handle logic and mapping fields between backend API and component API
 */
export const KeyStatusCardContainer: FC<KeyStatusCardContainerProps> = ({ data, keyType, now }) => {
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
      (data?.keyGenAuthorities ?? []).reduce((acc, cur) => {
        acc.add(cur);
        return acc;
      }, new Set() as KeyStatusCardProps['authorities']) ?? new Set<string>(),
    [data]
  );

  return (
    <KeyStatusCard
      title={title}
      titleInfo={titleInfo}
      instance={now}
      sessionNumber={Number(data?.session)}
      keyType={keyType}
      keyVal={data?.compressed ?? ''}
      startTime={data?.start ?? null}
      endTime={data?.end ?? null}
      authorities={authorities}
      totalAuthorities={authorities.size}
      fullDetailUrl={data ? `drawer/${data.id}` : ''}
    />
  );
};
