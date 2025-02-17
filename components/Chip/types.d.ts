import { ReactNode } from '../../../../../node_modules/react';
import { ComponentBase } from '../../types';
export type ChipColors = 'green' | 'blue' | 'purple' | 'yellow' | 'red' | 'grey' | 'dark-grey';
/**
 * The `Chip` props
 */
export interface ChipProps extends ComponentBase {
    /**
     * The visual style of the badge
     *
     * @type {("green"|"blue"|"purple"|"yellow"|"red" | "grey" | "dark-grey")}
     *
     * @default "green"
     */
    color?: ChipColors;
    /**
     * If `true`, the chip will display as disabled state
     */
    isDisabled?: boolean;
    isSelected?: boolean;
    children?: ReactNode;
}
export type ChipClassNames = {
    [key in ChipColors]: {
        active: string;
        disabled: string;
        selected: string;
    };
};
