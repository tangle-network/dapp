'use client';

import { Transition } from '@headlessui/react';
import { BoxLine } from '@webb-tools/icons';
import { Banner } from '@webb-tools/webb-ui-components/components/Banner';
import { GITHUB_BUG_REPORT_URL } from '@webb-tools/webb-ui-components/constants';
import { FC, useState } from 'react';

const FeedbackBanner: FC = () => {
  const [showBanner, setShowBanner] = useState(true);

  const onCloseHandler = () => {
    setShowBanner(false);
  };

  return (
    <Transition show={showBanner}>
      <Banner
        onClose={onCloseHandler}
        Icon={BoxLine}
        buttonText="SHARE NOW"
        bannerText="Tangle dApp is currently in Beta: Help us improve with your feedback."
        buttonProps={{
          href: GITHUB_BUG_REPORT_URL,
          target: '_blank',
        }}
      />
    </Transition>
  );
};

export default FeedbackBanner;
