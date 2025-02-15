import type { ComponentBase } from '../../types';

import type { TitleWithInfoProps } from '../TitleWithInfo/types';

export interface CardTableProps extends ComponentBase {
  titleProps: TitleWithInfoProps;
  leftTitle?: React.ReactElement;
}
