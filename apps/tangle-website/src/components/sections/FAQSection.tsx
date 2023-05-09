import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionContent,
} from '@webb-tools/webb-ui-components';

import { SectionDescription2, SectionHeader, SectionTitle } from '..';

const faqItems = [
  {
    question: 'What is the Tangle Token (TNT) and what is it used for?',
    answer:
      'Amet duo ipsum sanctus sanctus aliquyam lorem ipsum voluptua. Dolor erat aliquyam aliquyam ipsum duo amet amet ea. Vero invidunt.',
  },
  {
    question: 'How to deploy dApps on Tangle Network?',
    answer:
      'Amet duo ipsum sanctus sanctus aliquyam lorem ipsum voluptua. Dolor erat aliquyam aliquyam ipsum duo amet amet ea. Vero invidunt.',
  },
  {
    question: 'How are collators rewards calculated?',
    answer:
      'Amet duo ipsum sanctus sanctus aliquyam lorem ipsum voluptua. Dolor erat aliquyam aliquyam ipsum duo amet amet ea. Vero invidunt.',
  },
];

export const FAQSection = () => {
  return (
    <section className="bg-mono-0 py-20 px-5 lg:flex lg:flex-col lg:items-center">
      <div className="max-w-[1440px] mx-auto lg:px-[15%]">
        <div className="flex flex-col items-center mb-9">
          <SectionHeader className="text-center pb-2">Learn More</SectionHeader>
          <SectionTitle className="pb-4">
            Frequently asked questions
          </SectionTitle>
          <SectionDescription2 className="text-center">
            Need more information? Explore our documentation site or connect
            with others in our community channels to learn more!
          </SectionDescription2>
        </div>
        <Accordion
          defaultValue={[faqItems[0].question]}
          type="multiple"
          className="lg:mx-auto"
        >
          {faqItems.map((item, index) => (
            <AccordionItem
              key={index}
              value={item.question}
              className="border-b border-mono-40 px-0"
            >
              <AccordionButton className="px-0 gap-8 items-start">
                {item.question}
              </AccordionButton>
              <AccordionContent className="px-0 pr-[52.5px]">
                <SectionDescription2>{item.answer}</SectionDescription2>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
