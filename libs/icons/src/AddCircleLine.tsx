import { createIcon } from './create-icon';
import { IconBase } from './types';

export const AddCircleLine = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M11 11V7h2v4h4v2h-4v4h-2v-4H7v-2h4zm1 11C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16z',
    displayName: 'AddCircleLine',
  });
};
