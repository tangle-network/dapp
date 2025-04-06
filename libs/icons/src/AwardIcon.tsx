import { createIcon } from './create-icon';
import { IconBase } from './types';

export const AwardIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    colorUsingStroke: true,
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    path: (
      <>
        <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
        <circle cx="12" cy="8" r="6" />
      </>
    ),
    displayName: 'AwardIcon',
  });
};
