import { createIcon } from './create-icon';
import { IconBase } from './types';

export const AddLineIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    viewBox: '0 0 16 16',
    d: 'M7.33398 7.33203V3.33203H8.66732V7.33203H12.6673V8.66536H8.66732V12.6654H7.33398V8.66536H3.33398V7.33203H7.33398Z',
    displayName: 'AddLineIcon',
  });
};
