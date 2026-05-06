import { createIcon } from './create-icon';
import { IconBase } from './types';

const SpamLineIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    viewBox: '0 0 54 54',
    d: 'M35.8538 5.62695L48.375 18.1481V35.8557L35.8538 48.377H18.1462L5.625 35.8557V18.1481L18.1462 5.62695H35.8538ZM33.9898 10.127H20.0102L10.125 20.0121V33.9918L20.0102 43.877H33.9898L43.875 33.9918V20.0121L33.9898 10.127ZM24.7484 33.7502H29.2484V38.2502H24.7484V33.7502ZM24.7484 15.7503H29.2484V29.2502H24.7484V15.7503Z',
    displayName: 'SpamLineIcon',
  });
};

export default SpamLineIcon;
