import { useStore } from '@webb-dapp/react-environment';
import { darkPallet, lightPallet } from '@webb-dapp/ui-components/styling/colors';

export const useColorPallet = () => {
  const uiStore = useStore('ui');
  return uiStore.theme === 'dark' ? darkPallet : lightPallet;
};
