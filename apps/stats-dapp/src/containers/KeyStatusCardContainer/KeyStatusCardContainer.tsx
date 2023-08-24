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
  const {
    dkgDataFromPolkadotAPI: {
      currentSessionNumber,
      currentKey,
      currentSessionTimeFrame: { start: sessionStart, end: sessionEnd },
    },
  } = useStatsContext();

  const { time } = useStatsContext();

  return (
    <KeyStatusCard
      title="Active Key"
      titleInfo="The public key of the DKG protocol that is currently active."
      instance={time}
      sessionNumber={currentSessionNumber}
      keyType="current"
      keyVal={currentKey ?? ''}
      startTime={sessionStart}
      endTime={sessionEnd}
      authorities={new Set<string>()}
      totalAuthorities={0}
      fullDetailUrl={currentKey ? `drawer/${currentKey}` : ''}
    />
  );
};
