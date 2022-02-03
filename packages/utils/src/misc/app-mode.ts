export type AppMode = 'development' | 'production';

export function appMode(): AppMode {
  // @ts-ignore
  return process.env.REACT_APP_BUILD_ENV;
}

export function isProduction() {
  return !isDevelopment();
}

export function isDevelopment() {
  return appMode() === 'development';
}

export function isLocalFixtures() {
  return process.env.REACT_APP_LOCL_FIXTURES === 'true';
}

export function withLocalFixtures() {
  const dev = isDevelopment();
  return dev && isLocalFixtures;
}
