import { FC, ReactNode } from 'react';
import cx from 'classnames';
import { Typography } from '@webb-tools/webb-ui-components';

import {
  ShieldedPoolUseCase1,
  ShieldedPoolUseCase2,
  ShieldedPoolUseCase3,
} from '../svgs';

interface UseCaseProps {
  icon: ReactNode;
  title: string;
  description: string;
}

const useCases: Array<UseCaseProps> = [
  {
    icon: <ShieldedPoolUseCase1 />,
    title: 'Private Bridge Transfers',
    description:
      'Re-establish your privacy when you move funds across chain using zero-knowledge transactions.',
  },
  {
    icon: <ShieldedPoolUseCase2 />,
    title: 'Private Proof of Ownership',
    description:
      "Prove asset ownership with zero-knowledge proof by verifying UTXO ownership within Webb's Shielded Pools.",
  },
  {
    icon: <ShieldedPoolUseCase3 />,
    title: 'Swapping',
    description:
      'Engage in a new, private cross chain ecosystem for swapping assets such as NFTs.',
  },
];

export const ShieldedPoolUseCasesSection = () => {
  return (
    <section className="py-[64px] md:py-[156px] px-4 lg:px-0">
      <div className="max-w-[900px] mx-auto flex flex-col gap-6 md:gap-[70px]">
        <Typography
          variant="mkt-h3"
          className={cx(
            'text-center text-mono-200 font-black',
            '!text-[36px] !leading-[48px] md:!text-[48px] md:!leading-[60px]'
          )}
        >
          Use Cases
        </Typography>
        <div className="flex flex-col md:flex-row gap-6">
          {useCases.map((useCase, idx) => (
            <UseCaseItem
              key={idx}
              icon={useCase.icon}
              title={useCase.title}
              description={useCase.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const UseCaseItem: FC<UseCaseProps> = ({ icon, title, description }) => {
  return (
    <div
      className={cx(
        '!bg-white flex-[1] p-6 rounded-lg',
        'flex flex-col gap-[10px]',
        'shadow-[0px_4px_4px_rgba(0,0,0,0.25)]'
      )}
    >
      {icon}
      <Typography
        variant="mkt-body1"
        className="font-black !text-[24px] !leading-[40px]"
      >
        {title}
      </Typography>
      <Typography variant="mkt-body1" className="text-mono-140">
        {description}
      </Typography>
    </div>
  );
};
