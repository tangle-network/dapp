import { createIcon } from './create-icon';
import { IconBase } from './types';

export const WavesLadderIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    colorUsingStroke: true,
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    path: (
      <>
        <path d="M19 5a2 2 0 0 0-2 2v11" />
        <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
        <path d="M7 13h10" />
        <path d="M7 9h10" />
        <path d="M9 5a2 2 0 0 0-2 2v11" />
      </>
    ),
    displayName: 'WavesLadderIcon',
  });
};
