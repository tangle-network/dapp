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

  // Extra check to make sure the active key is the same as the one from polkadot API
  const activeKeyData = useMemo(() => {
    return {
      key:
        currentKey?.compressed === dkgDataFromPolkadotAPI?.currentKey
          ? currentKey?.compressed
          : dkgDataFromPolkadotAPI?.currentKey,
      session:
        Number(currentKey?.session) ===
        dkgDataFromPolkadotAPI?.currentSessionNumber
          ? Number(currentKey?.session)
          : dkgDataFromPolkadotAPI?.currentSessionNumber,
    };
  }, [data, dkgDataFromPolkadotAPI, currentKey]);

  return (
    <KeyStatusCard
      title="Active Key"
      titleInfo="The public key of the DKG protocol that is currently active."
      instance={time}
      sessionNumber={activeKeyData.session}
      keyType="current"
      keyVal={activeKeyData.key ?? ''}
      startTime={currentKey?.start ?? new Date()}
      endTime={
        currentKey?.end ?? new Date(new Date().getTime() + sessionHeight * 1000)
      }
      authorities={authorities ?? new Set<string>()}
      totalAuthorities={authorities.size ?? 0}
      fullDetailUrl={data ? `drawer/${currentKey?.id}` : ''}
    />
  );
};
