import { useContext } from 'react';
import { ExtensionData, ExtensionContext } from '@webb-dapp/react-environment';

/**
 * @name useAccounts
 */
export const useAccounts = (): ExtensionData => {
  const data = useContext(ExtensionContext);

  return data;
};
