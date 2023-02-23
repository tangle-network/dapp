import { createIcon } from './create-icon';
import { IconBase } from './types';

export const SaveWithBg = (props: IconBase) => {
  return createIcon({
    ...props,
    path: [
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="18" height="18" rx="9" fill="#81B3F6" />
        <path
          d="M14 16V10.6667L6 10.6667L6 16H4.66667C4.48986 16 4.32029 15.9298 4.19526 15.8047C4.07024 15.6797 4 15.5101 4 15.3333L4 4.66667C4 4.48986 4.07024 4.32029 4.19526 4.19526C4.32029 4.07024 4.48986 4 4.66667 4L13.3333 4L16 6.66667V15.3333C16 15.5101 15.9298 15.6797 15.8047 15.8047C15.6797 15.9298 15.5101 16 15.3333 16H14ZM12.6667 16L7.33333 16V12L12.6667 12V16Z"
          fill="#181F2B"
        />
        <rect
          x="1"
          y="1"
          width="18"
          height="18"
          rx="9"
          stroke="#81B3F6"
          stroke-width="2"
        />
      </svg>,
    ],
    displayName: 'SaveWithBg',
  });
};
