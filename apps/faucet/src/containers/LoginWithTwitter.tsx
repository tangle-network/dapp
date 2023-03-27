import { Button } from '@webb-tools/webb-ui-components';
import { useObservableState } from 'observable-hooks';
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useFaucetContext } from '../provider';

// The mocked login with twitter function
const mockedLoginWithTwitter = (): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('@alice.eth');
    }, 1500);
  });
};

const LoginWithTwitter = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { twitterHandle$ } = useFaucetContext();

  const handleLoginWithTwitter = useCallback(async () => {
    try {
      setIsLoggingIn(true);
      const twitterHandle = await mockedLoginWithTwitter();
      twitterHandle$.next(twitterHandle);
    } catch (error) {
      console.error('Error logging in with Twitter', error);
    } finally {
      setIsLoggingIn(false);
    }
  }, [twitterHandle$]);

  return (
    <div>
      <Button
        isLoading={isLoggingIn}
        loadingText="Logging In"
        onClick={handleLoginWithTwitter}
        isFullWidth
      >
        Login with Twitter
      </Button>
    </div>
  );
};

export default LoginWithTwitter;
