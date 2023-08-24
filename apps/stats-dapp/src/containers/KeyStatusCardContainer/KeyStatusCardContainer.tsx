import { KeyStatusCard } from '@webb-tools/webb-ui-components/components/KeyStatusCard';
import { useStatsContext } from '../../provider/stats-provider';

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
    />
  );
};
