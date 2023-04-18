import { LoggerService } from '@webb-tools/browser-utils';
import { CheckboxCircleLine } from '@webb-tools/icons';
import { Button, Typography } from '@webb-tools/webb-ui-components';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import clientConfig from '../config/client';
import FaucetError from '../errors/FaucetError';
import FaucetErrorCode from '../errors/FaucetErrorCode';
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

  const searchParams = useSearchParams();

  const { code, state, error } = useMemo(() => {
    return {
      code: searchParams.get('code'),
      error: searchParams.get('error'),
      state: searchParams.get('state'),
    };
  }, [searchParams]);

  // Loading by default and reset in the effect
  const [isLoggingIn, setIsLoggingIn] = useState(true);

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
    (error: FaucetError<FaucetErrorCode>, abortSignal: AbortSignal) => {
      if (abortSignal?.aborted) {
        // Ignore the error if the request was aborted
        return;
      }

      const logger = LoggerService.get(error.name);
      logger.error(error.message);

      setLoginError(error.getDisplayMessage());
    },
    []
  );

  // Effect for checking the query params and reset the loading state
  useEffect(() => {
    if (!code) {
      setIsLoggingIn(false);
    }
  }, [code]);

  // Effect for handling the login when the code and state are available
  useEffect(() => {
    // The abort controller for the login request
    const abortController = new AbortController();

    const loginWithTw = async () => {
      if (!code || !state || error) {
        if (state && error) {
          handleError(
            FaucetError.fromTwitterError(error),
            abortController.signal
          );
          router.replace(router.pathname, undefined, { shallow: true });
        }
        return;
      }

      setIsLoggingIn(true);
      setLoginError('');

      const result = await loginWithTwitter(code, abortController.signal);
      if (!result) {
        setIsLoggingIn(false);
        return;
      }

      result.match(handleResponse, (error) => {
        handleError(error, abortController.signal);
      });

      setIsLoggingIn(false);

      // Delete the query params
      router.replace(router.pathname, undefined, { shallow: true });
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

      const result = await refreshTwitterTokens(
        refreshToken,
        abortContr.signal
      );
      if (!result) {
        setIsLoggingIn(false);
        return;
      }

      result.match(handleResponse, (_) => {
        // Ignore the error and clear the store if the request was failed
        if (!abortContr.signal.aborted) {
          setStore({});
        }
      });

      setIsLoggingIn(false);
    };

    refreshTokens();

    return () => {
      abortContr.abort();
    };
  }, [expiresIn, handleResponse, refreshToken, setStore]);

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

      {twitterHandle ? (
        <Button
          onClick={handleLogout}
          className="mt-2 ml-auto !normal-case"
          variant="link"
          size="sm"
        >
          Logout @{twitterHandle}
        </Button>
      ) : (
        loginError && (
          <Typography
            component="p"
            ta="center"
            variant="mkt-utility"
            className="!text-red-70 mt-2"
          >
            {loginError}
          </Typography>
        )
      )}
    </div>
  );
};

export default LoginWithTwitter;
