import { TESTNET_LEADERBOARD_URL } from '@tangle-network/ui-components/constants';
import type { FAQItem } from '@tangle-network/ui-components/containers/FAQSection';

const EDGEWARE_URL = 'https://www.edgeware.io/';

const ALLOCATION_DOCS_URL =
  'https://docs.tangle.tools/network/tokenomics/allocation';

const FAQ = [
  {
    question: 'How can I become qualified for the TNT airdrop?',
    answer: (
      <>
        {'To qualify for the airdrop, you may engage in '}
        <a
          href={TESTNET_LEADERBOARD_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Tangle Incentivized Testnet Campaign
        </a>
        {
          '. The primary way to participate is by running a validator node on the testnet, which earns you points and a position on the testnet leaderboard.\n\nAdditionally, if you were an '
        }
        <a href={EDGEWARE_URL} target="_blank" rel="noopener noreferrer">
          Edgeware
        </a>
        {
          ' genesis or 2023 snapshot participant, you are also eligible to qualify for the airdrop. DOT Validators are also eligible from a March 2024 snapshot. For the full details on the allocation, '
        }
        <a href={ALLOCATION_DOCS_URL} target="_blank" rel="noopener noreferrer">
          see our documentation.
        </a>
      </>
    ),
  },
  {
    question: 'How many TNT tokens are allocated for the airdrop?',
    answer: (
      <>
        {
          'A total of 5 million TNT tokens are allocated for the airdrop, amounting to 5% of the total genesis amount. These are distributed among several groups: 2% for the '
        }
        <a
          href={TESTNET_LEADERBOARD_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Tangle Testnet Leaderboard
        </a>
        {' participants, 1% for DOT Validators, 1% for '}
        <a href={EDGEWARE_URL} target="_blank" rel="noopener noreferrer">
          Edgeware
        </a>
        {' Genesis participants, and 1% for '}
        <a href={EDGEWARE_URL} target="_blank" rel="noopener noreferrer">
          Edgeware
        </a>
        {
          ' 2023 Snapshot participants. For the full details on the allocation, '
        }
        <a href={ALLOCATION_DOCS_URL} target="_blank" rel="noopener noreferrer">
          see our documentation.
        </a>
      </>
    ),
  },
  {
    question: 'How are claimed airdrop tokens distributed and vested?',
    answer: (
      <>
        {
          'Upon claiming, 10% of your airdropped TNT tokens are immediately liquid. The remaining 90% are locked in a cliff contract and become withdrawable after the unlock timestamp (default: 180 days after deployment). These parameters are configured on-chain before the first claim. For the full details on the allocation, '
        }
        <a href={ALLOCATION_DOCS_URL} target="_blank" rel="noopener noreferrer">
          see our documentation.
        </a>
      </>
    ),
  },
] as const satisfies Array<FAQItem>;

export default FAQ;
