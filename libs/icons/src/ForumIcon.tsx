import { createIcon } from './create-icon';
import { IconBase } from './types';

export const ForumIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    path: (
      <path d="M16 0.632568H2C0.895431 0.632568 0 1.528 0 2.63257V12.4693C0 13.5739 0.895429 14.4693 2 14.4693H7.59184L12.4898 19.3673V14.4693H16C17.1046 14.4693 18 13.5739 18 12.4693V2.63257C18 1.528 17.1046 0.632568 16 0.632568Z" />
    ),
    displayName: 'ForumIcon',
  });
};
