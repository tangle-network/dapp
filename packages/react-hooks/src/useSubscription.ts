import { useEffect, useRef } from 'react';
import { Subscription } from 'rxjs';

export const useSubscription = (run: () => Subscription | undefined, tracker: any[]): void => {
  const subscription = useRef<Subscription>();

  useEffect(() => {
    if (subscription.current) {
      subscription.current.unsubscribe();
    }

    subscription.current = run();
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [...tracker]);
};
