import { createIcon } from './create-icon';
import { IconBase } from './types';

export const Save = (props: IconBase) => {
  return createIcon({
    ...props,
    width: 20,
    height: 20,
    viewBox: '0 0 16 16',
    path: [
      <path
        className="fill-mono-140 dark:fill-mono-40"
        d="M4.66667 12.6667L4.66667 8.66667L11.3333 8.66667V12.6667H12.6667L12.6667 5.21867L10.7813 3.33333L3.33333 3.33333L3.33333 12.6667H4.66667ZM2.66667 2L11.3333 2L14 4.66667L14 13.3333C14 13.5101 13.9298 13.6797 13.8047 13.8047C13.6797 13.9298 13.5101 14 13.3333 14L2.66667 14C2.48986 14 2.32029 13.9298 2.19526 13.8047C2.07024 13.6797 2 13.5101 2 13.3333L2 2.66667C2 2.48986 2.07024 2.32029 2.19526 2.19526C2.32029 2.07024 2.48986 2 2.66667 2ZM6 10L6 12.6667L10 12.6667V10H6Z"
        fill="#E2E5EB"
      />,
    ],
    displayName: 'Save',
  });
};
