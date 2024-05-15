import { createIcon } from './create-icon';
import { IconBase } from './types';

export const LoginBoxLineIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M4 15h2v5h12V4H6v5H4V3a1 1 0 011-1h14a1 1 0 011 1v18a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm6-4V8l5 4-5 4v-3H2v-2h8z',
    displayName: 'LoginBoxLineIcon',
  });
};
