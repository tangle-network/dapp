import type { FAQItem } from '@webb-tools/webb-ui-components/containers/FAQSection';

const faq = [
  {
    question:
      'How many TNT do I get for contributing the Tangle Network Crowdloan?',
    answer: 'TBD',
  },
  {
    question: 'How long will the TNT tokens be locked?',
    answer: 'TBD',
  },
  {
    question: 'Where are the TNT held during a crowdloan?',
    answer: 'TBD',
  },
] as const satisfies Array<FAQItem>;

export default faq;
