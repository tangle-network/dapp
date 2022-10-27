import { SettingContext, SettingDate } from '@webb-tools/react-environment/SettingProvider';
import { useContext } from 'react';

export const useSetting = (): SettingDate => {
  return useContext(SettingContext);
};
