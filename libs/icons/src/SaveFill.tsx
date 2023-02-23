import { createIcon } from './create-icon';
import { IconBase } from './types';

export const SaveFill = (props: IconBase) => {
  return createIcon({
    ...props,
    path: [
      <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 14V8.66667L4 8.66667L4 14H2.66667C2.48986 14 2.32029 13.9298 2.19526 13.8047C2.07024 13.6797 2 13.5101 2 13.3333L2 2.66667C2 2.48986 2.07024 2.32029 2.19526 2.19526C2.32029 2.07024 2.48986 2 2.66667 2L11.3333 2L14 4.66667L14 13.3333C14 13.5101 13.9298 13.6797 13.8047 13.8047C13.6797 13.9298 13.5101 14 13.3333 14H12ZM10.6667 14L5.33333 14V10L10.6667 10V14Z"
          fill="#E2E5EB"
        />
      </svg>,
    ],
    displayName: 'SaveFill',
  });
};
