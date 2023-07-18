import {
  SettingContext,
  SettingDate,
} from '@webb-tools/api-provider-environment';
import { useContext } from 'react';

export const useSetting = (): SettingDate => {
  return useContext(SettingContext);
};
