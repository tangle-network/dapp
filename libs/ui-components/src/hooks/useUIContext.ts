import { useContext } from 'react';

import UIContext from '../provider/UIContext';

/**
 * The hook use the read the UI Context configurations (ex: `theme`, etc...)
 * @returns `UIContext` contains all configures for the UI Context
 */
export function useUIContext() {
  return useContext(UIContext);
}
