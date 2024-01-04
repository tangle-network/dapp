'use client';

import assert from 'assert';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { IS_DEBUG_MODE } from '../constants';
import { MOCK_USER } from '../constants/mock';
import {
  ApiRoute,
  RelativePageUrl,
  extractResponseData,
  sendApiRequest,
} from '../utils';

export type User = Readonly<{
  id: string;
  githubUsername: string;
  email: string;
  twitterHandle?: string;
  website?: string;
  shortBio?: string;
  activatedCircuitCount: number;

  /**
   * A Unix timestamp in milliseconds.
   */
  createdAt: number;
}>;

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  refreshAuth: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  refreshAuth: async () => {
    //
  },
  logout: () => {
    //
  },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(
    IS_DEBUG_MODE ? MOCK_USER : null
  );

  const [isLoggedIn, setIsLoggedIn] = useState(IS_DEBUG_MODE);

  const updateAuth = async () => {
    try {
      const response = await sendApiRequest<{
        user: User;
      }>(ApiRoute.AuthValidate, {
        credentials: 'include',
      });

      if (response.innerResponse.isSuccess) {
        setUser(extractResponseData(response).user);
        setIsLoggedIn(true);
      } else {
        // No need to redirect to login page, but inform the
        // user that their credentials are invalid or expired.
        // TODO: Alert the user that the login attempt failed.
        throw new Error('Not authenticated');
      }
    } catch (error) {
      if (!IS_DEBUG_MODE) {
        setUser(null);
        setIsLoggedIn(false);
      }
    }
  };

  const logout = async () => {
    await sendApiRequest(ApiRoute.AuthLogout, {
      method: 'POST',
      credentials: 'include',
    });

    setUser(null);
    setIsLoggedIn(false);
  };

  // Check if user is logged in on first render.
  useEffect(() => {
    updateAuth();
  }, []);

  const value = { user, isLoggedIn, refreshAuth: updateAuth, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => useContext(AuthContext);

export const useRequireAuth = (): User => {
  const auth = useAuth();

  if (!auth.isLoggedIn) {
    alert(
      'You must be logged in to access this page or resource. Please, sign in then try again.'
    );

    window.location.href = RelativePageUrl.Home;

    // To prevent the code below from running, return the
    // mock user object until the page is redirected. This is
    // because of the way that redirects are processed by the
    // browser: they are asynchronous, so the code below may
    // run before the redirect is processed.
    return MOCK_USER;
  }

  assert(auth.user !== null, 'User should not be null if logged in');

  return auth.user;
};
