import { useLatestThresholdsLazyQuery } from '../../generated/graphql';
import { thresholdMap } from '../../provider/hooks/mappers/thresholds';
import { Loadable } from '../../provider/hooks/types';
import { useStatsContext } from '../../provider/stats-provider';
import { useEffect, useState } from 'react';

type SessionThresholdValue = {
  sessionId: string;
  keygenThreshold: number;
  signatureThreshold: number;
};
type LatestThresholdsValue = Loadable<Array<SessionThresholdValue>>;
/**
 *  Network thresholds history
 *  @param isLatest - When this is set to `true` the hook will fetch only the latest thresholds, When it's set to `false` the hook will fetch last month thresholds
 *
 * */
export function useSessionThreshold(isLatest: boolean): LatestThresholdsValue {
  const stats = useStatsContext();
  const [value, setValue] = useState<LatestThresholdsValue>({
    val: null,
    isLoading: false,
    isFailed: false,
    error: undefined,
  });
  const [call, query] = useLatestThresholdsLazyQuery();

  useEffect(() => {
    const lastBlock = stats.metaData.activeSessionBlock;
    const month = (30 * 24 * 60 * 60) / stats.blockTime;
    const block = Math.max(lastBlock - month, 0);
    call({
      variables: {
        first: isLatest ? 25 : undefined,
        filter: isLatest
          ? undefined
          : {
              blockNumber: {
                greaterThanOrEqualTo: block,
              },
            },
      },
    }).catch((e) => {
      setValue({
        isFailed: true,
        error: e?.message,
        val: null,
        isLoading: false,
      });
    });
  }, [call, stats, isLatest]);

  useEffect(() => {
    const subscription = query.observable
      .map((res): LatestThresholdsValue => {
        if (res.data && res.data.sessions) {
          const sessions = res.data.sessions.nodes
            .map((s): Partial<SessionThresholdValue> => {
              const session = s;
              const map = thresholdMap(session.thresholds);
              return {
                sessionId: session.id,
                keygenThreshold: map.KEY_GEN?.current,
                signatureThreshold: map.SIGNATURE?.current,
              };
            })
            .filter(
              (s) => s.keygenThreshold && s.signatureThreshold,
            ) as SessionThresholdValue[];

          return {
            val: sessions,
            isFailed: false,
            isLoading: false,
          };
        }
        return {
          isLoading: res.loading,
          isFailed: Boolean(res.error),
          error: res.error?.message ?? undefined,
          val: null,
        };
      })
      .subscribe(setValue);
    return () => subscription.unsubscribe();
  }, [query]);

  return value;
}
