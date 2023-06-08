import { SwiperTemplate, SwiperItemType } from './SwiperTemplate';

const privacySwiperItems: Array<SwiperItemType> = [
  {
    title: 'Independent privacy sets are not scalable.',
    description:
      'Traditional zero-knowledge applications have a single global privacy set that can only be interacted with from a single place.',
    stepImg: '/static/svgs/privacy-set-step-1.svg',
    illustrationImg: '/static/svgs/privacy-set-illustration-step-1.svg',
  },
  {
    title: 'Aggregating privacy sets scales privacy.',
    description:
      'Aggregating privacy sets allows us to scale privacy to the sum of each private sets size and grow access from many locations.',
    stepImg: '/static/svgs/privacy-set-step-2.svg',
    illustrationImg: '/static/svgs/privacy-set-illustration-step-2.svg',
  },
  {
    title: 'Connecting privacy sets requires distributed coordination.',
    description:
      'Each tree maintains a view of the roots of the other trees to achieve connection.',
    stepImg: '/static/svgs/privacy-set-step-3.svg',
    illustrationImg: '/static/svgs/privacy-set-illustration-step-3.svg',
  },
  {
    title: 'Together, we power cross-chain zero-knowledge messaging.',
    description:
      'In a connected system, users can insert zero-knowledge messages from any endpoint.',
    stepImg: '/static/svgs/privacy-set-step-4.svg',
    illustrationImg: '/static/svgs/privacy-set-illustration-step-4.svg',
  },
  {
    title: 'Attest to messages in zero-knowledge after updates propagate.',
    description:
      'Views are updated, recording the messages which have been added to endpoints. ',
    stepImg: '/static/svgs/privacy-set-step-5.svg',
    illustrationImg: '/static/svgs/privacy-set-illustration-step-5.svg',
  },
  {
    title: 'Prove zero-knowledge messages exist from any connected anchor.',
    description:
      'Users prove messages exist in any privacy set from any location in a way that benefits all participants.',
    stepImg: '/static/svgs/privacy-set-step-6.svg',
    illustrationImg: '/static/svgs/privacy-set-illustration-step-6.svg',
  },
];

export const PrivacyScaleSwiper = () => {
  return <SwiperTemplate swiperItems={privacySwiperItems} />;
};
