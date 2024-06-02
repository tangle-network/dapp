// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

export type AppMode = 'development' | 'production';
export function appMode(): AppMode {
  return process.env.NODE_ENV as AppMode;
}

export function isProduction() {
  return !isDevelopment();
}

export function isDevelopment() {
  return appMode() === 'development';
}

export function isLocalFixtures() {
  return process.env.LOCAL_FIXTURES === 'true';
}

export function withLocalFixtures() {
  const dev = isDevelopment();

  return dev && isLocalFixtures();
}
