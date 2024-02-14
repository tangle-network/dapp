import type { FAQItem } from '@webb-tools/webb-ui-components/containers/FAQSection';

const faq = [
  {
    question:
      'How can I become qualified for the TNT airdrop?',
    answer: 'To qualify for the airdrop, you may engage in Tangle Incentivized Testnet Campaign. The primary way to participate is by running a validator node on the testnet, which earns you points and a position on the testnet leaderboard.\n\nAdditionally, if you were an Edgeware genesis or snapshot participant, you are also eligible to qualify for the airdrop.',
  },
  {
    question: 'How many TNT tokens are allocated for the airdrop?',
    answer: 'A total of 4 million TNT tokens are allocated for the airdrop, with distribution of 2% for Tangle Testnet Leaderboard achievers, 1% for Edgeware Genesis participants, and 1% for Edgeware Snapshot participants.',
  },
  {
    question: 'How are claimed tokens distributed and vested?',
    answer: 'Upon claiming, 5% of your airdropped TNT tokens will be immediately liquid. The remaining 95% will be locked for 2 years with a 1-month cliff, after which tokens will vest linearly with each block.\n\nThis means participants will receive a portion of their vested tokens per block until the full amount has been distributed over the two-year period.',
  },
] as const satisfies Array<FAQItem>;

export default faq;
