import { createIcon } from './create-icon';
import { IconBase } from './types';

export const FilterIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M6.17 18.003a3.001 3.001 0 015.66 0H22v2H11.83a3.001 3.001 0 01-5.66 0H2v-2h4.17zm6-7a3 3 0 015.66 0H22v2h-4.17a3.001 3.001 0 01-5.66 0H2v-2h10.17zm-6-7a3.001 3.001 0 015.66 0H22v2H11.83a3 3 0 01-5.66 0H2v-2h4.17zm2.83 2a1 1 0 100-2 1 1 0 000 2zm6 7a1 1 0 100-2 1 1 0 000 2zm-6 7a1 1 0 100-2 1 1 0 000 2z',
    displayName: 'Filter',
  });
};
