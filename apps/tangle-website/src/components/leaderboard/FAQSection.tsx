import { Typography } from '@webb-tools/webb-ui-components';

import { FAQAccordion } from '..';

const faqItems = [
  {
    question: 'What is the Tangle Testnet Incentivization Campaign??',
    answer:
      "The introduction of rewards within the testnet creates a dynamic ecosystem that fosters collaboration among developers, encourages innovation, and incentivizes active engagement. By offering recognition and benefits, the testnet initiative aims to motivate participants to contribute their expertise, explore the network's capabilities, and help identify and address potential issues. The rewards system also paves the way for the future of the Tangle Network by encouraging ongoing participation and attracting a diverse range of users.",
  },
  {
    question: 'How long will the Tangle incentivized testnet run for?',
    answer:
      'The purpose of the testnet is to ensure the security and privacy, in addition to the overall functionality, of the network. Accordingly, we estimate that 1.5-2 months will be sufficient, but are still planning the exact duration.',
  },
  {
    question: 'What activities are rewarded with points?',
    answer: (
      <a
        href="https://docs.webb.tools/docs/tangle-network/overview/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-left text-mono-160 decoration-mono-160 hover:underline"
      >
        See our documentation for the full list and instructions for each.
      </a>
    ),
  },
  {
    question: 'What rewards can I expect by participating?',
    answer:
      "We're focusing on concierge access to our team for developers, publicity for successful validators and more. Details to come.",
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
