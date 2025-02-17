import { ComponentBase } from '../../types';
import { TitleWithInfoProps } from '../TitleWithInfo/types';
export interface CardTableProps extends ComponentBase {
    titleProps: TitleWithInfoProps;
    leftTitle?: React.ReactElement;
}
