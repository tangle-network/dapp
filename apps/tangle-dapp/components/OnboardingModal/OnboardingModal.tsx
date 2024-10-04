import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  TANGLE_DOCS_URL,
} from '@webb-tools/webb-ui-components';
import { FC, ReactElement, useEffect, useRef, useState } from 'react';

import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';
import { OnboardingItemProps } from './OnboardingItem';

export enum OnboardingPageKey {
  BRIDGE,
  LIQUID_STAKING,
  RESTAKE,
  BLUEPRINTS,
  NOMINATE,
}

export type OnboardingModalProps = {
  pageKey: OnboardingPageKey;
  linkHref?: string;
  children:
    | ReactElement<OnboardingItemProps>
    | ReactElement<OnboardingItemProps>[];
};

const OnboardingModal: FC<OnboardingModalProps> = ({
  pageKey,
  children,
  linkHref = TANGLE_DOCS_URL,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const seenRef = useRef(false);

  const { setWithPreviousValue, refresh } = useLocalStorage(
    LocalStorageKey.ONBOARDING_MODALS_SEEN,
  );

  // On load, check if the user has seen this modal before.
  // If not, then trigger the modal to be shown, and remember
  // that it has been seen.
  useEffect(() => {
    // Handle any possible data race.
    if (seenRef.current) {
      return;
    }

    const seenOpt = refresh();
    const seen = seenOpt.orElse([]);

    // The user hasn't seen this modal yet. Show it, and remember
    // that it has been seen.
    if (!seen.includes(pageKey)) {
      seenRef.current = true;
      setIsOpen(true);

      setWithPreviousValue((prev) => {
        if (prev === null || prev.value === null) {
          return [pageKey];
        }

        return [...prev.value, pageKey];
      });
    }
  }, [pageKey, refresh, setWithPreviousValue]);

  return (
    <Modal open>
      <ModalContent isCenter isOpen={isOpen} className="w-[750px]">
        <ModalHeader onClose={() => setIsOpen(false)}>Quick Start</ModalHeader>

        <div className="p-9 space-y-6">{children}</div>

        <ModalFooter className="flex gap-2">
          <Button
            href={linkHref}
            target="_blank"
            rel="noopener noreferrer"
            isFullWidth
            variant="secondary"
          >
            Learn More
          </Button>

          <Button isFullWidth onClick={() => setIsOpen(false)}>
            Got It
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default OnboardingModal;
