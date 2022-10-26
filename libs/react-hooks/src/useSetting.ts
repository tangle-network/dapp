import { SettingContext, SettingDate } from '@nepoche/react-environment/SettingProvider';
import { useContext } from 'react';

export const useSetting = (): SettingDate => {
  return useContext(SettingContext);
};
