import { CheckboxCircleLine } from '@webb-tools/icons';
import { Button } from '@webb-tools/webb-ui-components';
import { useObservableState } from 'observable-hooks';
import { useCallback, useState } from 'react';

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

  const twitterHandle = useObservableState(twitterHandle$);

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

  const handleLogout = useCallback(() => {
    twitterHandle$.next('');
  }, [twitterHandle$]);

  return (
    <div>
      <Button
        isLoading={isLoggingIn}
        loadingText="Logging In"
        onClick={handleLoginWithTwitter}
        isFullWidth
        isDisabled={!!twitterHandle}
        rightIcon={
          twitterHandle ? (
            <CheckboxCircleLine className="!fill-green-70" size="lg" />
          ) : undefined
        }
        variant={twitterHandle ? 'secondary' : 'primary'}
      >
        {twitterHandle ? 'Identity Verified' : 'Login with Twitter'}
      </Button>

      {twitterHandle && (
        <Button
          onClick={handleLogout}
          className="mt-2 ml-auto !normal-case"
          variant="link"
          size="sm"
        >
          Logout {twitterHandle}
        </Button>
      )}
    </div>
  );
};

export default LoginWithTwitter;
