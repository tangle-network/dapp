import { createIcon } from './create-icon';
import { IconBase } from './types';

export const SaveWithBg = (props: IconBase) => {
  return createIcon({
    ...props,
    width: 20,
    height: 20,
    viewBox: '0 0 20 20',
    path: [
      <rect
        x="1"
        y="1"
        width="18"
        height="18"
        rx="9"
        className="stroke-blue-70 dark:stroke-blue-50"
        strokeWidth="2"
      />,
      <rect
        x="1"
        y="1"
        width="18"
        height="18"
        rx="9"
        className="fill-blue-70 dark:fill-blue-50"
      />,
      <path
        d="M14 16V10.6667L6 10.6667L6 16H4.66667C4.48986 16 4.32029 15.9298 4.19526 15.8047C4.07024 15.6797 4 15.5101 4 15.3333L4 4.66667C4 4.48986 4.07024 4.32029 4.19526 4.19526C4.32029 4.07024 4.48986 4 4.66667 4L13.3333 4L16 6.66667V15.3333C16 15.5101 15.9298 15.6797 15.8047 15.8047C15.6797 15.9298 15.5101 16 15.3333 16H14ZM12.6667 16L7.33333 16V12L12.6667 12V16Z"
        className="fill-blue-10 dark:fill-blue-120"
      />,
    ],
    displayName: 'SaveWithBg',
  });
};
