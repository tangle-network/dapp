import { createIcon } from './create-icon';
import { IconBase } from './types';

const StarLineIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    width: 16,
    height: 16,
    viewBox: '0 0 16 16',
    d: 'M7.9991 12.173L3.2968 14.8051L4.34702 9.51961L0.390625 5.86087L5.74198 5.22638L7.9991 0.333008L10.2562 5.22638L15.6075 5.86087L11.6512 9.51961L12.7014 14.8051L7.9991 12.173ZM7.9991 10.645L10.8302 12.2297L10.1979 9.04747L12.58 6.84461L9.35803 6.46257L7.9991 3.51635L6.64012 6.46257L3.41817 6.84461L5.80024 9.04747L5.16792 12.2297L7.9991 10.645Z',
    displayName: 'StarLineIcon',
  });
};

export default StarLineIcon;
