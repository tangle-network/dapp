import type { WebbComponentBase } from '../../types';

import type { TitleWithInfoProps } from '../TitleWithInfo/types';

export interface CardTableProps extends WebbComponentBase {
  titleProps: TitleWithInfoProps;
  leftTitle?: React.ReactElement;
}
