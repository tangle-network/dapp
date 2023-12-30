import { createIcon } from './create-icon';
import { IconBase } from './types';

const CheckLineIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    viewBox: '0 0 16 16',
    d: 'M6.66453 10.1136L12.7928 3.98535L13.7356 4.92816L6.66453 11.9992L2.42188 7.7566L3.36468 6.81381L6.66453 10.1136Z',
    displayName: 'CheckLineIcon',
  });
};

export default CheckLineIcon;
