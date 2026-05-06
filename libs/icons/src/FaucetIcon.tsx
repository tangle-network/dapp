import { createIcon } from './create-icon';
import { IconBase } from './types';

export const FaucetIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M12 3.1L7.05 8.05a7 7 0 109.9 0L12 3.1zm0-2.828l6.364 6.364a9 9 0 11-12.728 0L12 .272zM13 11h2.5L11 17.5V13H8.5L13 6.5V11z',
    displayName: 'FaucetIcon',
  });
};
