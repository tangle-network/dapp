'use client';

import { ArrowRightIcon } from '@radix-ui/react-icons';
import { RowSelectionState } from '@tanstack/table-core';
import TopBanner from '@webb-tools/tangle-shared-ui/components/blueprints/TopBanner';
import {
  BLUEPRINTS_OPERATOR_DESCRIPTION,
  BLUEPRINTS_OPERATOR_HIGHLIGHTED_TEXT,
  BLUEPRINTS_OPERATOR_TITLE,
} from '@webb-tools/tangle-shared-ui/constants';
import useBlueprintListing from '@webb-tools/tangle-shared-ui/data/blueprints/useFakeBlueprintListing';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import {
  Modal,
  ModalTrigger,
} from '@webb-tools/webb-ui-components/components/Modal';
import pluralize from '@webb-tools/webb-ui-components/utils/pluralize';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import useRoleStore, { Role } from '../../stores/roleStore';
import BlueprintListing from './BlueprintListing';
import PricingModal from './PricingModal';
import { PricingFormResult } from './PricingModal/types';
import RegistrationReview from './RegistrationReview';

export const dynamic = 'force-static';

const ROLE_TITLE = {
  [Role.OPERATOR]: BLUEPRINTS_OPERATOR_TITLE,
  [Role.DEPLOYER]: 'Deploy your first',
} satisfies Record<Role, string>;

const ROLE_HIGHLIGHTED_TEXT = {
  [Role.OPERATOR]: BLUEPRINTS_OPERATOR_HIGHLIGHTED_TEXT,
  [Role.DEPLOYER]: 'Instance',
} satisfies Record<Role, string>;

const ROLE_DESCRIPTION = {
  [Role.OPERATOR]: BLUEPRINTS_OPERATOR_DESCRIPTION,
  [Role.DEPLOYER]:
    'Select a Blueprint, customize settings, and deploy your decentralized service instance in minutes.',
} satisfies Record<Role, string>;

const Page = () => {
  const { role } = useRoleStore();

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({
    '0': true,
  });
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  const [isReviewOpen, setIsReviewOpen] = useState(true);
  const [pricingSettings, setPricingSettings] =
    useState<PricingFormResult | null>(null);

  const { blueprints, isLoading, error } = useBlueprintListing();

  const selectedBlueprints = useMemo(() => {
    return Object.keys(rowSelection)
      .filter((blueprintId) => rowSelection[blueprintId])
      .map((blueprintId) => blueprints[blueprintId])
      .filter((blueprint) => blueprint !== undefined);
  }, [blueprints, rowSelection]);

  const size = Object.keys(selectedBlueprints).length;

  const handlePricingFormSubmit = useCallback((result: PricingFormResult) => {
    setPricingSettings(result);
    setIsReviewOpen(true);
  }, []);

  const handleCloseReview = useCallback(() => {
    setIsReviewOpen(false);
  }, []);

  if (isReviewOpen) {
    return (
      <RegistrationReview
        selectedBlueprints={selectedBlueprints}
        pricingSettings={pricingSettings}
        onClose={handleCloseReview}
      />
    );
  }

  return (
    <div className="space-y-5">
      <TopBanner
        title={ROLE_TITLE[role]}
        highlightedText={ROLE_HIGHLIGHTED_TEXT[role]}
        description={ROLE_DESCRIPTION[role]}
      />

      <BlueprintListing
        blueprints={blueprints}
        isLoading={isLoading}
        error={error}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />

      <Modal open={isPricingModalOpen} onOpenChange={setIsPricingModalOpen}>
        <AnimatePresence>
          {size > 0 && (
            <motion.div
              className={twMerge(
                'fixed bottom-2 w-screen max-w-4xl p-6 -translate-x-1/2 left-1/2 rounded-xl',
                'flex items-center justify-between',
                "bg-[url('/static/assets/blueprints/selected-blueprint-panel.png')]",
              )}
              initial={{ opacity: 0, bottom: -100 }}
              animate={{ opacity: 1, bottom: 2 }}
              exit={{ opacity: 0, bottom: -100 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-6">
                <p className="font-bold text-mono-0 body1">
                  {size} {pluralize('Blueprint', size > 1)} selected
                </p>

                <Button variant="link" onClick={() => setRowSelection({})}>
                  Clear
                </Button>
              </div>

              <ModalTrigger asChild>
                <Button rightIcon={<ArrowRightIcon width={24} height={24} />}>
                  Register
                </Button>
              </ModalTrigger>
            </motion.div>
          )}
        </AnimatePresence>

        <PricingModal
          onOpenChange={setIsPricingModalOpen}
          blueprints={selectedBlueprints}
          onSubmit={handlePricingFormSubmit}
        />
      </Modal>
    </div>
  );
};

export default Page;
