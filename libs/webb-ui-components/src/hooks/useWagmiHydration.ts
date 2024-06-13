'use client';

import { useEffect, useState } from 'react';
import { useConfig } from 'wagmi';
import 'zustand/middleware';
import type { Mutate, StoreApi } from 'zustand/vanilla';

/**
 * A hook to determine whether the wagmi config has been hydrated
 * on the client side.
 * It is utilizing the zustand store to determine the hydration status.
 * @returns a boolean indicating whether the wagmi config has been hydrated.
 *
 * @see https://docs.pmnd.rs/zustand/integrations/persisting-store-data#how-can-i-check-if-my-store-has-been-hydrated
 */
export default function useWagmiHydration() {
  const [hydrated, setHydrated] = useState(false);

  const wagmiConfig = useConfig();

  useEffect(() => {
    const store: Mutate<
      StoreApi<unknown>,
      [['zustand/persist', unknown]]
    > = wagmiConfig._internal.store;

    const unsubHydrate = store.persist.onHydrate(() => setHydrated(false));

    const unsubFinishHydration = store.persist.onFinishHydration(() =>
      setHydrated(true),
    );

    setHydrated(store.persist.hasHydrated());

    return () => {
      unsubHydrate();
      unsubFinishHydration();
    };
  }, [wagmiConfig._internal.store]);

  return hydrated;
}
