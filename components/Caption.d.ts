import { FC } from '../../../../node_modules/react';
export type CaptionProps = {
    children: string | string[];
    linkText?: string;
    linkHref?: string;
};
export declare const Caption: FC<CaptionProps>;
