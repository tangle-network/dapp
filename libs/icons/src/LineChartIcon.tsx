import { createIcon } from './create-icon';
import { IconBase } from './types';

export const LineChartIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    viewBox: '0 0 16 16',
    d: 'M3.33333 2V12.6667H14V14H2V2H3.33333ZM13.5286 4.19526L14.4714 5.13807L10.6667 8.9428L8.66667 6.94333L5.80474 9.80473L4.86193 8.86193L8.66667 5.05719L10.6667 7.05667L13.5286 4.19526Z',
    displayName: 'LineChartIcon',
  });
};
