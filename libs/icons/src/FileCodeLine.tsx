import { createIcon } from './create-icon';
import { IconBase } from './types';

export const FileCodeLine = (props: IconBase) => {
  return createIcon({
    ...props,
    path: (
      <path d="M12 2H2V18H16V6H12V2ZM0 0.992C0 0.444 0.447 0 0.999 0H13L18 5V18.993C18.0009 19.1243 17.976 19.2545 17.9266 19.3762C17.8772 19.4979 17.8043 19.6087 17.7121 19.7022C17.6199 19.7957 17.5101 19.8701 17.3892 19.9212C17.2682 19.9723 17.1383 19.9991 17.007 20H0.993C0.730378 19.9982 0.479017 19.8931 0.293218 19.7075C0.107418 19.5219 0.00209465 19.2706 0 19.008V0.992ZM14.657 10L11.121 13.536L9.707 12.121L11.828 10L9.708 7.879L11.121 6.464L14.657 10ZM3.343 10L6.88 6.464L8.294 7.879L6.172 10L8.292 12.121L6.879 13.536L3.343 10Z" />
    ),
    displayName: 'FileCodeLine',
  });
};
