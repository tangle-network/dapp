import { createIcon } from '../create-icon';
import { IconBase } from '../types';

export const KeplrIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    size: props.size ?? 'lg',
    displayName: 'KeplrIcon',
    path: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="24" height="24" rx="5" fill="#7B68EE" />
        <path
          d="M7 7V17H9V13L11 11L15 17H17.5L12.5 10L17 6H14L9 11V7H7Z"
          fill="white"
        />
      </svg>
    ),
  });
};
