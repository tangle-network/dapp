import { useLatestThresholdsLazyQuery } from '@webb-dapp/page-statistics/generated/graphql';
import { useEffect, useState } from 'react';
import { Loadable } from '@webb-dapp/page-statistics/provider/hooks/types';
import { thresholdMap } from '@webb-dapp/page-statistics/provider/hooks/mappers/thresholds';
type SessionThresholdValue = {
  sessionId: string;
  keygenThreshold: number;
  signatureThreshold: number;
};
type LatestThresholdsValue = Loadable<Array<SessionThresholdValue>>;
export function useSessionThreshold(): LatestThresholdsValue {
  const [value, setValue] = useState<LatestThresholdsValue>({
    val: null,
    isLoading: false,
    isFailed: false,
    error: undefined,
  });
  const [call, query] = useLatestThresholdsLazyQuery();

  useEffect(() => {
    call().catch((e) => {
      setValue({
        isFailed: true,
        error: e?.message,
        val: null,
        isLoading: false,
      });
    });
  }, [call]);

  useEffect(() => {
    const subscription = query.observable
      .map((res): LatestThresholdsValue => {
        if (res.data && res.data.sessions) {
          const sessions = res.data.sessions.nodes
            .map((s): Partial<SessionThresholdValue> => {
              const session = s!;
              const map = thresholdMap(session.thresholds);
              return {
                sessionId: session.id,
                keygenThreshold: map.KYE_GEN?.current,
                signatureThreshold: map.SIGNATURE?.current,
              };
            })
            .filter((s) => s.keygenThreshold && s.signatureThreshold) as SessionThresholdValue[];

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
