import { Card, Typography } from '@webb-tools/webb-ui-components';
import Image from 'next/image';
import { FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import { StaticAssetPath } from '../../constants/index';
import { RestakingProfileType } from './ManageProfileModalContainer';

export type ChooseMethodStepProps = {
  method: RestakingProfileType;
  setMethod: (method: RestakingProfileType) => void;
};

const ChooseMethodStep: FC<ChooseMethodStepProps> = ({ method, setMethod }) => {
  return (
    <div className="flex gap-5">
      <OptionCard
        method={RestakingProfileType.Independent}
        selectedMethod={method}
        setSelected={setMethod}
      >
        <Image
          src={StaticAssetPath.RestakingMethodIndependent}
          alt="Independent restaking method illustration"
          width={120}
          height={120}
        />

        <Typography variant="h5" fw="bold">
          Independent
        </Typography>

        <Typography variant="body2" fw="normal" className="text-center">
          Allocate variable amounts to each role independently.
        </Typography>
      </OptionCard>

      <OptionCard
        method={RestakingProfileType.Shared}
        selectedMethod={method}
        setSelected={setMethod}
      >
        <Image
          src={StaticAssetPath.RestakingMethodShared}
          alt="Shared restaking method illustration"
          width={120}
          height={120}
        />

        <Typography variant="h5" fw="bold">
          Shared
        </Typography>

        <Typography variant="body2" fw="normal" className="text-center">
          Allocate a single amount to be shared between selected roles.
        </Typography>
      </OptionCard>
    </div>
  );
};

type OptionCardProps = {
  method: RestakingProfileType;
  selectedMethod: RestakingProfileType;
  children: ReactNode;
  setSelected: (method: RestakingProfileType) => void;
};

/** @internal */
const OptionCard: FC<OptionCardProps> = ({
  method,
  selectedMethod,
  children,
  setSelected,
}) => {
  const isSelected = selectedMethod === method;

  const isSelectedClassName = isSelected
    ? 'dark:border-mono-140'
    : 'border-transparent cursor-pointer';

  return (
    <Card
      onClick={() => setSelected(method)}
      className={twMerge(
        'flex justify-center items-center gap-1 space-y-0 border-[3px]  rounded-2xl dark:bg-mono-160',
        isSelectedClassName
      )}
    >
      {children}
    </Card>
  );
};

export default ChooseMethodStep;
