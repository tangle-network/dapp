import { IconButton, Typography } from '@webb-tools/webb-ui-components';
import { usePathname } from 'next/navigation';
import { FC } from 'react';

import useOnboardingStore from '../../context/useOnboardingStore';
import { PagePath } from '../../types';

const PAGES_WITH_ONBOARDING: PagePath[] = [
  PagePath.LIQUID_STAKING,
  PagePath.RESTAKE,
  PagePath.NOMINATION,
];

const OnboardingHelpButton: FC = () => {
  const { setOnboardingReopenFlag } = useOnboardingStore();
  const pathName = usePathname();

  const isOnOnboardingPage = PAGES_WITH_ONBOARDING.some((pagePath) =>
    pathName.startsWith(pagePath),
  );

  // Don't render if on a page that doesn't have onboarding.
  if (!isOnOnboardingPage) {
    return null;
  }

  return (
    <IconButton
      onClick={() => setOnboardingReopenFlag(true)}
      tooltip="Learn how to use this page"
      className="rounded-full border-2 py-2 px-4 bg-mono-0/10 border-mono-60 dark:bg-mono-0/5 dark:border-mono-140 dark:hover:bg-mono-0/10"
    >
      <Typography variant="body1" fw="bold">
        ?
      </Typography>
    </IconButton>
  );
};

export default OnboardingHelpButton;
