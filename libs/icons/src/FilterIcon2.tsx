import { createIcon } from './create-icon';
import { IconBase } from './types';

export const FilterIcon2 = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M10 18H14V16H10V18ZM3 6V8H21V6H3ZM6 13H18V11H6V13Z',
    displayName: 'Filter',
  });
};
