import { Typography } from '@webb-tools/webb-ui-components';

import { FAQAccordion } from '..';

const faqItems = [
  {
    question: 'What is the Tangle Incentivized Testnet?',
    answer:
      'Kasd eos sanctus sea sed voluptua dolores est accusam sed, et lorem labore est stet, rebum sed dolor rebum erat sed. At labore sea ipsum diam. Sanctus amet takimata elitr.',
  },
  {
    question: 'How long will the Tangle incentivized testnet run for?',
    answer:
      'Kasd eos sanctus sea sed voluptua dolores est accusam sed, et lorem labore est stet, rebum sed dolor rebum erat sed. At labore sea ipsum diam. Sanctus amet takimata elitr.',
  },
  {
    question: 'What activities are rewarded with points?',
    answer:
      'Kasd eos sanctus sea sed voluptua dolores est accusam sed, et lorem labore est stet, rebum sed dolor rebum erat sed. At labore sea ipsum diam. Sanctus amet takimata elitr.',
  },
  {
    question: 'What rewards can I expect by participating?',
    answer:
      'Kasd eos sanctus sea sed voluptua dolores est accusam sed, et lorem labore est stet, rebum sed dolor rebum erat sed. At labore sea ipsum diam. Sanctus amet takimata elitr.',
  },
];

export const FAQSection = () => {
  return (
    <div className="space-y-[16px]">
      <Typography
        variant="mkt-h3"
        fw="black"
        className="text-center text-mono-200"
      >
        FAQ
      </Typography>
      <FAQAccordion items={faqItems} itemClassName="border-b border-mono-100" />
    </div>
  );
};
