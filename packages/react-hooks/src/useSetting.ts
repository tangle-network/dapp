import { useContext } from 'react';
import { SettingContext, SettingDate } from '@webb-dapp/react-environment/SettingProvider';

export const useSetting = (): SettingDate => {
  return useContext(SettingContext);
};
