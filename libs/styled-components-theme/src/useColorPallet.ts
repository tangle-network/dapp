import { useStore } from '@nepoche/react-environment';
import { darkPallet, lightPallet } from './styling';

export const useColorPallet = () => {
  const uiStore = useStore('ui');
  return uiStore.theme === 'dark' ? darkPallet : lightPallet;
};
