import { Typography } from '../../typography/Typography/Typography';
import { ComponentProps, FC, ReactNode } from '../../../../../node_modules/react';
export type FAQItem = {
    question: string;
    answer: string | ReactNode;
};
export type FAQSectionProps = {
    items: Array<FAQItem>;
    overrideTitleProps?: Partial<ComponentProps<typeof Typography>>;
    answerClassName?: string;
} & ComponentProps<'div'>;
declare const FAQSection: FC<FAQSectionProps>;
export default FAQSection;
