import { createIcon } from './create-icon';
import { IconBase } from './types';

const LoopRightFillIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M10 2.5C12.5905 2.5 14.8939 3.73053 16.3573 5.64274L14 8H20V2L17.7814 4.21863C15.9494 1.952 13.1444 0.5 10 0.5C4.47715 0.5 0 4.97715 0 10.5H2C2 6.08172 5.58172 2.5 10 2.5ZM18 10.5C18 14.9183 14.4183 18.5 10 18.5C7.40951 18.5 5.10605 17.2695 3.64274 15.3573L6 13H0V19L2.21863 16.7814C4.05062 19.048 6.85557 20.5 10 20.5C15.5228 20.5 20 16.0228 20 10.5H18Z',
    displayName: 'Mail',
  });
};

export default LoopRightFillIcon;
