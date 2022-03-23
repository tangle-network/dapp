import { LoggerService } from '@nepoche/app-util';

export type AppMode = 'development' | 'production';
const appLogger = LoggerService.get('App');
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
  return process.env.REACT_APP_LOCAL_FIXTURES === 'true';
}

export function withLocalFixtures() {
  const dev = isDevelopment();
  appLogger.info('local fixtures react app env: ', process.env.REACT_APP_LOCAL_FIXTURES);
  return dev && isLocalFixtures();
}
