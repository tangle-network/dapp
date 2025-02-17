import { ComponentProps } from '../../../../../node_modules/react';
import { Typography } from '../../typography/Typography/Typography';
export type AppTemplateTitleProps = ComponentProps<'div'> & {
    /**
     * Title of the template
     */
    title: string;
    /**
     * Subtitle of the template
     */
    subTitle?: string;
    /**
     * Subtitle position
     * @default top
     */
    subTitlePosition?: 'top' | 'bottom';
    /**
     * Override title props
     */
    overrideTitleProps?: Partial<ComponentProps<typeof Typography>>;
    /**
     * Override subtitle props
     */
    overrideSubTitleProps?: Partial<ComponentProps<typeof Typography>>;
};
