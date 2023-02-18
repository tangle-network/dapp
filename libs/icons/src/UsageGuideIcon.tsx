import { createIcon } from './create-icon';
import { IconBase } from './types';

export const UsageGuideIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M2 3.993A1 1 0 012.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 01-.992.993H2.992A.993.993 0 012 20.007V3.993zM11 5H4v14h7V5zm2 0v14h7V5h-7zm1 2h5v2h-5V7zm0 3h5v2h-5v-2z',
    displayName: 'UsageGuideIcon',
  });
};
