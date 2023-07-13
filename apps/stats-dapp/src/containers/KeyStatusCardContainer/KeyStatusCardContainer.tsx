import { KeyStatusCard } from '@webb-tools/webb-ui-components/components/KeyStatusCard';
import { KeyStatusCardProps } from '@webb-tools/webb-ui-components/components/KeyStatusCard/types';
import { Spinner } from '@webb-tools/icons';
import React, { FC, forwardRef, useMemo } from 'react';

import { KeyStatusCardContainerProps } from './types';
import { useStatsContext } from '../../provider/stats-provider';
import { PublicKey, useActiveKeys } from '../../provider/hooks';
/**
 * The wrapper of UI component. Handle logic and mapping fields between backend API and component API
 */
export const KeyStatusCardContainer = () => {
  const { dkgDataFromPolkadotAPI, sessionHeight } = useStatsContext();

  const { error, isFailed, isLoading, val: data } = useActiveKeys();

  const { currentKey } = useMemo<{
    currentKey: PublicKey | null | undefined;
  }>(() => {
    return {
      currentKey: data ? data[0] : null,
    };
  }, [data]);

  const { time } = useStatsContext();

  const authorities = useMemo(
    () =>
      (currentKey?.keyGenAuthorities ?? []).reduce((acc, cur) => {
        acc.add(cur);
        return acc;
      }, new Set() as KeyStatusCardProps['authorities']) ?? new Set<string>(),
    [data]
  );

  const activeKeyData = useMemo(() => {
    return {
      key: currentKey?.compressed,
      session: Number(currentKey?.session),
    };
  }, [data, currentKey]);

  return (
    <KeyStatusCard
      title="Active Key"
      titleInfo="The public key of the DKG protocol that is currently active."
      instance={time}
      sessionNumber={activeKeyData.session}
      keyType="current"
      keyVal={activeKeyData.key ?? ''}
      startTime={currentKey?.start ?? null}
      endTime={currentKey?.end ?? null}
      authorities={authorities ?? new Set<string>()}
      totalAuthorities={authorities.size ?? 0}
      fullDetailUrl={data ? `drawer/${currentKey?.id}` : ''}
    />
  );
};
