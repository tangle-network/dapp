import { CheckboxCircleLine } from '@webb-tools/icons';
import { Button } from '@webb-tools/webb-ui-components';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import clientConfig from '../config/client';
import useStore, { StoreKey } from '../store';
import { TwitterLoginResponse } from '../types';
import loginWithTwitter from '../utils/loginWithTwitter';
import refreshTwitterTokens from '../utils/refreshTwitterTokens';

const LoginWithTwitter = () => {
  const [getStore, setStore] = useStore();

  const twitterHandle = useMemo(() => {
    return getStore(StoreKey.twitterHandle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getStore(StoreKey.twitterHandle)]);

  const expiresIn = useMemo(() => {
    return getStore(StoreKey.expiresIn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getStore(StoreKey.expiresIn)]);

  const refreshToken = useMemo(() => {
    return getStore(StoreKey.refreshToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getStore(StoreKey.refreshToken)]);

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

  // Handle login button click
  const handleLoginButtonClick = useCallback(async () => {
    // Update the logging state for the UI
    setIsLoggingIn(true);
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    setStore({});
  }, [setStore]);

  // Handle response from twitter
  const handleResponse = useCallback(
    (twLoginResp: TwitterLoginResponse) => {
      const { accessToken, expiresIn, refreshToken, twitterHandle } =
        twLoginResp;

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
    },
    [setStore]
  );

  // Handle error
  const handleError = useCallback(
    (error: unknown, abortSignal?: AbortSignal) => {
      if (abortSignal?.aborted) {
        // Ignore the error if the request was aborted
        return;
      }

      console.error(error);

      if (error instanceof Error) {
        setLoginError(error.message);
      } else {
        setLoginError('There was an error logging in');
      }
    },
    []
  );

  // Effect for handling the login when the code and state are available
  useEffect(() => {
    // The abort controller for the login request
    const abortController = new AbortController();

    const loginWithTw = async () => {
      try {
        if (!code || !state || error) {
          return;
        }

        setIsLoggingIn(true);
        setLoginError('');

        const resp = await loginWithTwitter(code, abortController.signal);

        // Handle the response
        handleResponse(resp);

        // Delete the query params
        router.replace(router.pathname, undefined, { shallow: true });
      } catch (error) {
        handleError(error, abortController.signal);
      } finally {
        setIsLoggingIn(false);
      }
    };

    loginWithTw();

    return () => {
      abortController.abort();
    };
  }, [code, state, error, router, handleResponse, handleError]);

  // Effect for re-fetching the tokens when tokens are expired
  useEffect(() => {
    // The abort controller for the request
    const abortContr = new AbortController();

    const refreshTokens = async () => {
      try {
        if (!expiresIn || !refreshToken) {
          return;
        }

        const expiresAt = new Date(expiresIn).getTime();
        const current = new Date().getTime();

        // If the tokens are not expired, return
        if (expiresAt > current) {
          return;
        }

        setLoginError('');
        setIsLoggingIn(true);

        const resp = await refreshTwitterTokens(
          refreshToken,
          abortContr.signal
        );

        handleResponse(resp);
      } catch (error) {
        handleError(error, abortContr.signal);
      } finally {
        setIsLoggingIn(false);
      }
    };

    refreshTokens();

    return () => {
      abortContr.abort();
    };
  }, [expiresIn, handleError, handleResponse, refreshToken]);

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
          Logout @{twitterHandle}
        </Button>
      )}
    </div>
  );
};

export default LoginWithTwitter;
