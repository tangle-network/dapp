import { WEBB_DOC_ROUTES_RECORD } from '@webb-tools/webb-ui-components/constants';
import FAQContainer from '@webb-tools/webb-ui-components/containers/FAQSection';
import populateDocsUrl from '@webb-tools/webb-ui-components/utils/populateDocsUrl';

const faqItems = [
  {
    question: 'What is the Tangle Testnet Incentivization Campaign??',
    answer:
      'The leaderboard campaign incentivizes early validators to run Tangle Network nodes in return for a portion of genesis event tokens, and tracks their duration to reward them proportionally',
  },
  {
    question: 'How long will the Tangle incentivized testnet run for?',
    answer:
      'The incentivized phase of the Tangle Network testnet will conclude April 9th, with the launch of mainnet on April 10.',
  },
  {
    question: 'What activities are rewarded with points?',
    answer: (
      <a
        href={populateDocsUrl(
          WEBB_DOC_ROUTES_RECORD['tangle-network'].overview
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="text-left text-mono-160 decoration-mono-160 hover:underline"
      >
        Users earn leaderboard points by setting up and maintaining validator
        nodes.
      </a>
    ),
  },
  {
    question: 'What rewards can I expect by participating?',
    answer:
      'Leaderboard participants will receive a portion of genesis tokens via the Tangle Network Token airdrop.',
  },
];

const FAQSection = () => {
  return <FAQContainer items={faqItems} />;
};

export default FAQSection;
