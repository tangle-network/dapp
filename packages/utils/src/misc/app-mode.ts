import { LoggerService } from '@webb-tools/app-util';

export type AppMode = 'development' | 'production';
const appLogger = LoggerService.get('App');
export function appMode(): AppMode {
  // @ts-ignore
  return process.env.NODE_ENV;
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
  console.log('local fixtures react app env: ', process.env.LOCAL_FIXTURES);
  console.log('isDevelopment? ', dev);
  return dev && isLocalFixtures();
}
