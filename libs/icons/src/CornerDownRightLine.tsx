import { createIcon } from './create-icon';
import { IconBase } from './types';

export const CornerDownRightLine = (props: IconBase) => {
  return createIcon({
    ...props,
    viewBox: '0 0 16 16',
    path: (
      <path
        d="M3.333 9.334v-6h1.334v4.667h6.78L8.816 5.368l.943-.943L14 8.667 9.758 12.91l-.943-.943 2.633-2.633H3.333z"
        fill="#9CA0B0"
      />
    ),
    displayName: 'CornerDownRightLine',
  });
};
