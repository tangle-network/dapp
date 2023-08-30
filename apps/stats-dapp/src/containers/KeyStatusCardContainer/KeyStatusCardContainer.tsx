import { KeyStatusCard } from '@webb-tools/webb-ui-components/components/KeyStatusCard';
import { useStatsContext } from '../../provider/stats-provider';
import { useBlocks } from '../../provider/hooks';
import { useMemo } from 'react';

/**
 * The wrapper of UI component. Handle logic and mapping fields between backend API and component API
 */
export const KeyStatusCardContainer = () => {
  const {
    dkgDataFromPolkadotAPI: {
      currentSessionNumber,
      currentKey,
      currentSessionTimeFrame: { start: sessionStart, end: sessionEnd },
      currentAuthorities,
    },
  } = useStatsContext();

  const { time } = useStatsContext();

  const { val: blocksData } = useBlocks();

  const showDetails = useMemo(() => {
    if (blocksData?.finalized && blocksData?.latestIndexedBlock) {
      if (blocksData.finalized - blocksData.latestIndexedBlock < 5) {
        return true;
      }
    }

    return false;
  }, [blocksData]);

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
      authorities={new Set<string>(currentAuthorities) ?? new Set<string>()}
      totalAuthorities={0}
      fullDetailUrl={currentKey ? `drawer/${currentKey}` : ''}
      showDetails={showDetails}
    />
  );
};
