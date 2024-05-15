import type { WebbComponentBase } from '../../types/index.js';

import type { TitleWithInfoProps } from '../TitleWithInfo/types.js';

export interface CardTableProps extends WebbComponentBase {
  titleProps: TitleWithInfoProps;
  leftTitle?: React.ReactElement;
}
