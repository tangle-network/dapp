'use client';

import { Typography } from '../../typography/Typography/Typography';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionContent,
} from '../../components/Accordion';
import type { ComponentProps, FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export type FAQItem = {
  question: string;
  answer: string | ReactNode;
};

export type FAQSectionProps = {
  items: Array<FAQItem>;
  overrideTitleProps?: Partial<ComponentProps<typeof Typography>>;
  answerClassName?: string;
} & ComponentProps<'div'>;

const FAQSection: FC<FAQSectionProps> = ({
  items,
  className,
  overrideTitleProps,
  answerClassName,
  ...props
}) => {
  return (
    <div {...props} className={twMerge('space-y-4', className)}>
      <Typography
        variant="mkt-h3"
        fw="black"
        {...overrideTitleProps}
        className={twMerge(
          'text-center text-mono-200',
          overrideTitleProps?.className
        )}
      >
        {overrideTitleProps?.children ?? 'FAQ'}
      </Typography>

      <Accordion collapsible type="single">
        {items.map((item, index) => (
          <AccordionItem
            key={index}
            value={item.question}
            className="p-0 border-b border-mono-100"
          >
            <AccordionButton className="gap-2 px-0 py-4">
              <Typography
                variant="mkt-body2"
                className="font-black text-mono-200"
              >
                {item.question}
              </Typography>
            </AccordionButton>
            <AccordionContent className="px-0">
              <Typography
                variant="mkt-body2"
                className={twMerge(
                  'font-medium whitespace-pre-wrap text-mono-160',
                  answerClassName
                )}
              >
                {item.answer}
              </Typography>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default FAQSection;
