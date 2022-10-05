import * as React from 'react';

import { createIcon } from './create-icon';
import { IconBase } from './types';

export function OpenBook(props: IconBase) {
  return createIcon({
    ...props,
    d: 'M13 21v2h-2v-2H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6a3.99 3.99 0 0 1 3 1.354A3.99 3.99 0 0 1 15 3h6a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-8zm7-2V5h-5a2 2 0 0 0-2 2v12h7zm-9 0V7a2 2 0 0 0-2-2H4v14h7z',
    displayName: 'OpenBook',
  });
}
