import { createIcon } from './create-icon';
import { IconBase } from './types';

export const CheckSquareIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    colorUsingStroke: true,
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    path: (
      <>
        <path d="M21 10.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.5" />
        <path d="m9 11 3 3L22 4" />
      </>
    ),
    displayName: 'CheckSquareIcon',
  });
};
