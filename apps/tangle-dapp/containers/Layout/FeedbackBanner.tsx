'use client';

import { Transition } from '@headlessui/react';
import { BoxLine } from '@webb-tools/icons';
import { Banner } from '@webb-tools/webb-ui-components/components/Banner';
import { GITHUB_BUG_REPORT_URL } from '@webb-tools/webb-ui-components/constants';
import { FC, useCallback, useEffect, useState } from 'react';

import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';

const FeedbackBanner: FC = () => {
  // Initially, the banner is hidden until the value is
  // extracted from local storage.
  const [showBanner, setShowBanner] = useState(false);

  const {
    isSet: isBannerDismissalCacheSet,
    set: setCachedWasBannerDismissed,
    valueOpt: wasBannerDismissedOpt,
  } = useLocalStorage(LocalStorageKey.WAS_BANNER_DISMISSED);

  // If there is no cache key, show the banner by default.
  useEffect(() => {
    if (!isBannerDismissalCacheSet()) {
      setShowBanner(true);
    }
  }, [isBannerDismissalCacheSet, setShowBanner]);

  // If the banner was dismissed, do not show it to prevent
  // annoying the user.
  useEffect(() => {
    if (wasBannerDismissedOpt?.value === true) {
      setShowBanner(false);
    }
  }, [wasBannerDismissedOpt?.value]);

  const onCloseHandler = useCallback(() => {
    setShowBanner(false);
    setCachedWasBannerDismissed(true);
  }, [setCachedWasBannerDismissed]);

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
