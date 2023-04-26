import { KeyStatusCard } from '@webb-tools/webb-ui-components/components/KeyStatusCard';
import { KeyStatusCardProps } from '@webb-tools/webb-ui-components/components/KeyStatusCard/types';
import { Spinner } from '@webb-tools/icons';
import React, { FC, forwardRef, useMemo } from 'react';

import { KeyStatusCardContainerProps } from './types';
import { useStatsContext } from '../../provider/stats-provider';
/**
 * The wrapper of UI component. Handle logic and mapping fields between backend API and component API
 */
export const KeyStatusCardContainer: FC<KeyStatusCardContainerProps> = ({
  data,
  keyType,
  now,
}) => {
  const { dkgDataFromPolkadotAPI } = useStatsContext();

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

  // Extra check to make sure the active key is the same as the one from polkadot API
  const activeKeyData = useMemo(() => {
    return {
      key:
        data?.compressed === dkgDataFromPolkadotAPI?.currentKey
          ? data?.compressed
          : dkgDataFromPolkadotAPI?.currentKey,
      session:
        Number(data?.session) === dkgDataFromPolkadotAPI?.currentSessionNumber
          ? Number(data?.session)
          : dkgDataFromPolkadotAPI?.currentSessionNumber,
    };
  }, [data, dkgDataFromPolkadotAPI]);

  return (
    <KeyStatusCard
      title={title}
      titleInfo={titleInfo}
      instance={now}
      sessionNumber={activeKeyData.session}
      keyType={keyType}
      keyVal={activeKeyData.key ?? ''}
      startTime={data?.start ?? null}
      endTime={data?.end ?? null}
      authorities={authorities}
      totalAuthorities={authorities.size}
      fullDetailUrl={data ? `drawer/${data.id}` : ''}
    />
  );
};
