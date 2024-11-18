'use client';

import { OnboardingPageKey } from '@webb-tools/tangle-shared-ui/constants';
import useLocalStorage, {
  LocalStorageKey,
} from '@webb-tools/tangle-shared-ui/hooks/useLocalStorage';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
  TANGLE_DOCS_URL,
} from '@webb-tools/webb-ui-components';
import { FC, ReactElement, useEffect, useRef, useState } from 'react';

import useOnboardingStore from '../../context/useOnboardingStore';
import { OnboardingItemProps } from './OnboardingItem';

export type OnboardingModalProps = {
  title?: string;
  pageKey: OnboardingPageKey;
  learnMoreHref?: string;
  children:
    | ReactElement<OnboardingItemProps>
    | ReactElement<OnboardingItemProps>[];
};

const OnboardingModal: FC<OnboardingModalProps> = ({
  title = 'Quick Start',
  pageKey,
  children,
  learnMoreHref = TANGLE_DOCS_URL,
}) => {
  const { onboardingReopenFlag, setOnboardingReopenFlag } =
    useOnboardingStore();

  const [isOpen, setIsOpen] = useState(false);
  const seenRef = useRef(false);

  const { setWithPreviousValue, refresh } = useLocalStorage(
    LocalStorageKey.ONBOARDING_MODALS_SEEN,
  );

  // Re-open the modal if the user has requested so by clicking the
  // help button, which raises a global flag.
  useEffect(() => {
    if (onboardingReopenFlag) {
      setOnboardingReopenFlag(false);
      setIsOpen(true);
    }
  }, [onboardingReopenFlag, setOnboardingReopenFlag]);

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
      <ModalContent
        onInteractOutside={() => setIsOpen(false)}
        isOpen={isOpen}
        size="md"
      >
        <ModalHeader onClose={() => setIsOpen(false)}>{title}</ModalHeader>

        <ModalBody>{children}</ModalBody>

        <ModalFooterActions
          learnMoreLinkHref={learnMoreHref}
          onConfirm={() => setIsOpen(false)}
          confirmButtonText="Got It"
        />
      </ModalContent>
    </Modal>
  );
};

export default OnboardingModal;
