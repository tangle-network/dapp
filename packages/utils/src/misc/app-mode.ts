export type AppMode = 'development' | 'production';

export function appMode(): AppMode {
  // @ts-ignore
  return mode;
}

export function isProduction() {
  return !isDevelopment();
}

export function isDevelopment() {
  return appMode() === 'development';
}
