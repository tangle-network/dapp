import { IconSize } from '../../../../icons/src/types';
export interface IconsGroupProps {
    type: 'token' | 'chain';
    icons: string[];
    iconSize?: IconSize;
    className?: string;
}
