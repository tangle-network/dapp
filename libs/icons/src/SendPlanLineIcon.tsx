import { createIcon } from './create-icon';
import { IconBase } from './types';

export const SendPlanLineIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M3.741 1.408l18.462 10.154a.5.5 0 010 .876L3.741 22.592A.5.5 0 013 22.154V1.846a.5.5 0 01.741-.438zM5 13v6.617L18.85 12 5 4.383V11h5v2H5z',
    displayName: 'SendPlanLineIcon',
  });
};
