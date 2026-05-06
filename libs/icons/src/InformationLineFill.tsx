import { createIcon } from './create-icon';
import { IconBase } from './types';

export const InformationLineFill = (props: IconBase) => {
  return createIcon({
    ...props,
    viewBox: '0 0 20 20',
    d: 'M10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20ZM9 9V15H11V9H9ZM9 5V7H11V5H9Z',
    displayName: 'InformationLineFill',
  });
};
