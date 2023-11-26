'use client';

import {
  Accordion,
  AccordionButton,
  AccordionContent,
  AccordionItem,
} from '@webb-tools/webb-ui-components/components/Accordion';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import cx from 'classnames';
import type { FC, ReactNode } from 'react';

interface FAQAccordionProps {
  items: Array<{ question: string; answer: string | ReactNode }>;
  className?: string;
  itemClassName?: string;
}

const FAQAccordion: FC<FAQAccordionProps> = ({
  items,
  className,
  itemClassName,
}) => {
  return (
    <Accordion collapsible type="single" className={className}>
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          value={item.question}
          className={cx('p-0', itemClassName)}
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
              className="font-medium whitespace-pre-wrap text-mono-160"
            >
              {item.answer}
            </Typography>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default FAQAccordion;
