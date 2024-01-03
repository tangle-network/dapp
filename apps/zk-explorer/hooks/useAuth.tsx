'use client';

import assert from 'assert';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { IS_DEBUG_MODE } from '../constants';
import { MOCK_USER } from '../constants/mock';
import { ApiRoute, extractResponseData, sendApiRequest } from '../utils';

export type User = {
  id: string;
  githubUsername: string;
  email: string;
  createdAt: number;
  twitterHandle?: string;
  website?: string;
  shortBio?: string;
};

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  checkLogin: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
        throw new Error('Not authenticated');
      }
    } catch (error) {
      if (!IS_DEBUG_MODE) {
        setUser(null);
        setIsLoggedIn(false);
      } else {
        setUser(MOCK_USER);
        setIsLoggedIn(true);
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

  const value = { user, isLoggedIn, checkLogin: updateAuth, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => useContext(AuthContext);

export const useRequireAuth = (): User => {
  const auth = useAuth();

  if (!auth.isLoggedIn) {
    throw new Error('You must be logged in');
  }

  assert(auth.user !== null, 'User must not be null if logged in');

  return auth.user;
};
