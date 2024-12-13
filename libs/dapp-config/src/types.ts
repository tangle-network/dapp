// File contains shared types for dapp-config

/**
 * The type of the environment the dapp is running in
 */
export type AppEnvironment = 'development' | 'test' | 'staging' | 'production';

export const isAppEnvironmentType = (env: string): env is AppEnvironment => {
  return (
    env === 'development' ||
    env === 'test' ||
    env === 'staging' ||
    env === 'production'
  );
};
