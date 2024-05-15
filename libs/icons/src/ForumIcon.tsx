import { createIcon } from './create-icon';
import { IconBase } from './types';

export const ForumIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    path: (
      <path d="M14.5 0H3.12744C2.02287 0 1.12744 0.895431 1.12744 2V9.81699C1.12744 10.9216 2.02287 11.817 3.12744 11.817H7.6111L11.7941 16V11.817H14.5C15.6046 11.817 16.5 10.9216 16.5 9.81699V2C16.5 0.895431 15.6046 0 14.5 0Z" />
    ),
    viewBox: '0 0 21 16',
    displayName: 'ForumIcon',
  });
};
