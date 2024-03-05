import {
  Card,
  Typography,
  useNextDarkMode,
} from '@webb-tools/webb-ui-components';
import Image from 'next/image';
import { FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import { StaticAssetPath } from '../../constants/index';
import { RestakingProfileType } from './ManageProfileModalContainer';

export type ChooseMethodStepProps = {
  profileType: RestakingProfileType;
  setProfileType: (profileType: RestakingProfileType) => void;
};

const ChooseMethodStep: FC<ChooseMethodStepProps> = ({
  profileType,
  setProfileType,
}) => {
  const [isDarkMode] = useNextDarkMode();

  return (
    <div className="flex flex-col sm:flex-row gap-5">
      <OptionCard
        profileType={RestakingProfileType.Independent}
        selectedProfileType={profileType}
        setSelected={setProfileType}
      >
        <Image
          src={
            isDarkMode
              ? StaticAssetPath.RestakingMethodIndependentDark
              : StaticAssetPath.RestakingMethodIndependentLight
          }
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
        profileType={RestakingProfileType.Shared}
        selectedProfileType={profileType}
        setSelected={setProfileType}
      >
        <Image
          src={
            isDarkMode
              ? StaticAssetPath.RestakingMethodSharedDark
              : StaticAssetPath.RestakingMethodSharedLight
          }
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
  profileType: RestakingProfileType;
  selectedProfileType: RestakingProfileType;
  children: ReactNode;
  setSelected: (profileType: RestakingProfileType) => void;
};

/** @internal */
const OptionCard: FC<OptionCardProps> = ({
  profileType,
  selectedProfileType,
  children,
  setSelected,
}) => {
  const isSelected = selectedProfileType === profileType;

  const isSelectedClassName = isSelected
    ? 'border-mono-60 dark:border-mono-140'
    : 'border-transparent cursor-pointer';

  return (
    <Card
      onClick={() => setSelected(profileType)}
      className={twMerge(
        'flex justify-center items-center gap-1 space-y-0 border-[3px] rounded-2xl bg-mono-20 dark:bg-mono-160',
        isSelectedClassName
      )}
    >
      {children}
    </Card>
  );
};

export default ChooseMethodStep;
