import { SettingContext, SettingDate } from '@webb-dapp/react-environment/SettingProvider';
import { useContext } from 'react';

export const useSetting = (): SettingDate => {
  return useContext(SettingContext);
};
