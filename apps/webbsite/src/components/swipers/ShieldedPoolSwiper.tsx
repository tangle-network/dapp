import { SwiperTemplate, SwiperItemType } from './SwiperTemplate';

const shieldedPoolSwiperItems: Array<SwiperItemType> = [
  {
    title: 'Zero-Knowledge Shielded Asset Pools',
    description:
      'Leverage our shielded asset pools to enhance UTXO security. Key data, such as transaction amount and target chain, are securely enclosed in each deposit, enabling confidential transactions.',
    stepImg: '/static/svgs/shielded-pool-step-1.svg',
    illustrationImg: '/static/svgs/shielded-pool-illustration-1.svg',
  },
  {
    title: 'Shielded UTXOs for Enhanced Privacy',
    description:
      'Experience the benefits of shielded UTXOs. Our secure hashing techniques ensure your transaction data remains hidden, maintaining utmost privacy and integrity.',
    stepImg: '/static/svgs/shielded-pool-step-2.svg',
    illustrationImg: '/static/svgs/shielded-pool-illustration-2.svg',
  },
  {
    title: 'An Interoperable UTXO model',
    description:
      "Unlock the potential of UTXOs interacting across different chains. Utilizing the Anchor System's edge list, secure connections and enhanced privacy are maintained, evolving generic merkle trees into shielded UTXO sets.",
    stepImg: '/static/svgs/shielded-pool-step-3.svg',
    illustrationImg: '/static/svgs/shielded-pool-illustration-3.svg',
  },
  {
    title: 'Zero-Knowledge Constraints',
    description:
      'Safeguard your UTXO transactions with valid zero-knowledge proofs. Inappropriate withdrawal attempts, such as from the Ethereum mainnet, will be effectively denied due to mismatched chain constraints.',
    stepImg: '/static/svgs/shielded-pool-step-4.svg',
    illustrationImg: '/static/svgs/shielded-pool-illustration-4.svg',
  },
  {
    title: 'Robust Double-Spend Protection ',
    description:
      'Shielded UTXO spending demands a valid zero-knowledge proof. Potential double-spends are promptly detected and inappropriate withdrawal attempts are prevented, ensuring secure transactions.',
    stepImg: '/static/svgs/shielded-pool-step-5.svg',
    illustrationImg: '/static/svgs/shielded-pool-illustration-5.svg',
  },
];

export const ShieldedPoolSwiper = () => {
  return <SwiperTemplate swiperItems={shieldedPoolSwiperItems} />;
};
