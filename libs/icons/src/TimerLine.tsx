import { createIcon } from './create-icon.js';
import { IconBase } from './types.js';

const TimerLine = (props: IconBase) => {
  return createIcon({
    ...props,
    // viewBox: '0 0 16 16',
    d: 'M17.6177 6.4681L19.0711 5.01472L20.4853 6.42893L19.0319 7.88231C20.2635 9.42199 21 11.375 21 13.5C21 18.4706 16.9706 22.5 12 22.5C7.02944 22.5 3 18.4706 3 13.5C3 8.52944 7.02944 4.5 12 4.5C14.125 4.5 16.078 5.23647 17.6177 6.4681ZM12 20.5C15.866 20.5 19 17.366 19 13.5C19 9.63401 15.866 6.5 12 6.5C8.13401 6.5 5 9.63401 5 13.5C5 17.366 8.13401 20.5 12 20.5ZM11 8.5H13V14.5H11V8.5ZM8 1.5H16V3.5H8V1.5Z',
    displayName: 'TimerLine',
  });
};

export default TimerLine;
