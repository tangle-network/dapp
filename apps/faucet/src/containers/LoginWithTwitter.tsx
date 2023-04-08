import { CheckboxCircleLine } from '@webb-tools/icons';
import { Button } from '@webb-tools/webb-ui-components';
import { useRouter } from 'next/router';
import { useObservableState } from 'observable-hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';

import clientConfig from '../config/client';
import { useFaucetContext } from '../provider';
import useStore, { StoreKey } from '../store';
import { TwitterLoginBody, TwitterLoginResponse } from '../types';

// Parse and validate the tokens response from the server
const parseTokensResponse = (json: any): TwitterLoginResponse | never => {
  const { accessToken, expiresIn, refreshToken, twitterHandle } = json;

  if (!accessToken || !expiresIn || !refreshToken || !twitterHandle) {
    throw new Error('Invalid tokens response');
  }

  return {
    accessToken,
    expiresIn,
    refreshToken,
    twitterHandle,
  };
};

// The mocked login with twitter function
const loginWithTwitter = async (
  code: string
): Promise<TwitterLoginResponse> | never => {
  const body: TwitterLoginBody = {
    clientId: clientConfig.twitterClientId,
    code,
    codeVerifier: 'challenge',
    grantType: 'authorization_code',
    redirectUri: clientConfig.appUrl,
  };

  const headers = {
    'Content-Type': 'application/json',
  };

  const resp = await fetch('/api/auth/signin/twitter', {
    body: JSON.stringify(body),
    headers,
    method: 'POST',
  });

  if (!resp.ok) {
    throw new Error(
      `Error logging in with twitter: [${resp.status}] ${resp.statusText}`
    );
  }

  return parseTokensResponse(await resp.json());
};

const LoginWithTwitter = () => {
  const [getStore, setStore] = useStore();

  const twitterHandle = useMemo(() => {
    return getStore(StoreKey.twitterHandle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getStore(StoreKey.twitterHandle)]);

  const router = useRouter();

  const { code, state, error } = useMemo(() => {
    return {
      code: router.query.code as string | undefined,
      error: router.query.error as string | undefined,
      state: router.query.state as string | undefined,
    };
  }, [router.query]);

  const [isLoggingIn, setIsLoggingIn] = useState(() =>
    code && state ? true : false
  );

  // State for login error
  const [loginError, setLoginError] = useState('');

  // TODO: REMOVE
  useEffect(() => {
    console.group('ERROR');
    console.log('loginError', loginError);
    console.log('error', error);
    console.groupEnd();
  }, [loginError, error]);

  const handleLoginButtonClick = useCallback(async () => {
    // Update the logging state for the UI
    setIsLoggingIn(true);
  }, []);

  // TODO: ADD IMPLEMENTATION
  const handleLogout = useCallback(() => {
    // twitterHandle$.next('');
  }, []);

  useEffect(() => {
    const handleLogin = async () => {
      try {
        if (!code || !state || error) {
          return;
        }

        setIsLoggingIn(true);
        setLoginError('');

        const { accessToken, refreshToken, expiresIn, twitterHandle } =
          await loginWithTwitter(code);

        // Calculate the expiration date
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);

        // Update the store
        setStore({
          accessToken,
          expiresIn: expiresAt.toISOString(),
          refreshToken,
          twitterHandle,
        });

        router.replace(router.pathname, undefined, { shallow: true });
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          setLoginError(error.message);
        } else {
          setLoginError('There was an error logging in');
        }
      } finally {
        setIsLoggingIn(false);
      }
    };

    handleLogin();
  }, [code, state, error, setStore, router]);

  return (
    <div>
      <Button
        isLoading={isLoggingIn}
        loadingText="Logging In"
        isFullWidth
        isDisabled={!!twitterHandle}
        onClick={handleLoginButtonClick}
        href={clientConfig.twitterLoginUrl}
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
