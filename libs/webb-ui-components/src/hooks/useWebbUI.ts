import { useContext } from 'react';

import { WebbUIContext } from '../provider';

/**
 * The hook use the read the Webb UI Kit configurations (ex: `theme`, etc...)
 * @returns `WebbUIContext` contains all configures for the Webb UI Kit
 */
export function useWebbUI() {
  return useContext(WebbUIContext);
}
