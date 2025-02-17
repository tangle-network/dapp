import { ReactNode } from '../../../../../node_modules/react';
import { ComponentBase } from '../../types';
import { TypographyProps, TypographyVariant } from '../../typography/types';
/**
 * The `TiltieWithInfo` component props
 */
export interface TitleWithInfoProps extends ComponentBase {
    /**
     * The `title` to be displayed
     */
    title: string;
    /**
     * The `title` variant
     * @default "body1"
     */
    variant?: TypographyVariant;
    /**
     * The title tab
     * @default <span></span>
     */
    titleComponent?: TypographyProps['component'];
    /**
     * The class name of the title
     */
    titleClassName?: string;
    /**
     * The `info` appears inside the tooltip to describe the title
     */
    info?: ReactNode;
    /**
     * Whether center the info
     */
    isCenterInfo?: boolean;
}
