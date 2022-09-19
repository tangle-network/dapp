import { WebbComponentBase } from '@webb-dapp/webb-ui-components/types';

import { TitleWithInfoProps } from '../TitleWithInfo/types';

export interface CardTableProps extends WebbComponentBase {
  titleProps: TitleWithInfoProps;
  leftTitle?: React.ReactElement;
}
