import { ExtensionContext, ExtensionData } from '@webb-dapp/react-environment';
import { useContext } from 'react';

/**
 * @name useAccounts
 */
export const useAccounts = (): ExtensionData => {
  const data = useContext(ExtensionContext);

  return data;
};
