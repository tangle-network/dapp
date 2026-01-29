import { RowSelectionState } from '@tanstack/table-core';
import RestakeBanner from '@tangle-network/tangle-shared-ui/components/blueprints/RestakeBanner';
import {
  useAllBlueprints,
  useBlueprintsByOwner,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import useOperatorInfo from '@tangle-network/tangle-shared-ui/hooks/useOperatorInfo';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { Typography } from '@tangle-network/ui-components';
import { BLUEPRINT_DOCS_LINK } from '@tangle-network/ui-components/constants/tangleDocs';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import { AnimatePresence, motion } from 'framer-motion';
import { FC, useCallback, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import useRoleStore, { Role } from '../../stores/roleStore';
import { PagePath } from '../../types';
import BlueprintListing from './BlueprintListing';
import RegistrationDrawer from './RegistrationDrawer';

const ROLE_TITLE = {
  [Role.OPERATOR]: 'Register Your First Blueprint',
  [Role.DEPLOYER]: 'Deploy Your First Blueprint',
} satisfies Record<Role, string>;

const ROLE_DESCRIPTION = {
  [Role.OPERATOR]:
    'Select a Blueprint, customize settings, and register your decentralized service in minutes.',
  [Role.DEPLOYER]:
    'Select a Blueprint, customize settings, and deploy your decentralized service instance in minutes.',
} satisfies Record<Role, string>;

const HAS_BLUEPRINTS_TITLE = 'Manage Your Blueprints';
const HAS_BLUEPRINTS_DESCRIPTION =
  'View and manage your created blueprints, transfer ownership, or create new ones.';

const Page: FC = () => {
  const role = useRoleStore((store) => store.role);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { blueprints, isLoading, error, refetch } = useAllBlueprints();
  const { data: ownedBlueprints } = useBlueprintsByOwner();

  const { isOperator } = useOperatorInfo();

  const hasOwnedBlueprints =
    ownedBlueprints !== undefined && ownedBlueprints.length > 0;

  const selectedBlueprints = useMemo(() => {
    return (
      Object.keys(rowSelection)
        .filter((blueprintId) => rowSelection[blueprintId])
        .map((blueprintId) => blueprints.get(blueprintId))
        .filter((blueprint) => blueprint !== undefined)
    );
  }, [blueprints, rowSelection]);

  const selectedBlueprintCount = Object.keys(selectedBlueprints).length;

  const handleRegistrationComplete = useCallback(async () => {
    setRowSelection({});
    setIsDrawerOpen(false);
    // Wait for indexer to process, then refetch to get updated operator counts
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await refetch();
  }, [refetch]);

  const handleRemoveBlueprint = useCallback((blueprintId: string) => {
    setRowSelection((prev) => {
      const updated = { ...prev };
      delete updated[blueprintId];

      if (Object.keys(updated).length === 0) {
        setIsDrawerOpen(false);
      }

      return updated;
    });
  }, []);

  return (
    <div className="space-y-5">
      <RestakeBanner
        title={hasOwnedBlueprints ? HAS_BLUEPRINTS_TITLE : ROLE_TITLE[role]}
        description={
          hasOwnedBlueprints
            ? HAS_BLUEPRINTS_DESCRIPTION
            : ROLE_DESCRIPTION[role]
        }
        buttonHref={
          hasOwnedBlueprints ? PagePath.BLUEPRINTS_MANAGE : BLUEPRINT_DOCS_LINK
        }
        buttonText={hasOwnedBlueprints ? 'Manage Blueprints' : 'Get Started'}
        buttonVariant={hasOwnedBlueprints ? 'secondary' : 'link'}
        isExternalLink={!hasOwnedBlueprints}
      />

      <div className="flex items-center justify-between">
        <Typography
          variant="h5"
          fw="bold"
          className="text-mono-200 dark:text-mono-0"
        >
          Available Blueprints
        </Typography>
      </div>

      <BlueprintListing
        blueprints={blueprints}
        isLoading={isLoading}
        error={error}
        rowSelection={isOperator ? rowSelection : undefined}
        onRowSelectionChange={isOperator ? setRowSelection : undefined}
      />

      <AnimatePresence>
        {selectedBlueprintCount > 0 && !isDrawerOpen && (
          <motion.div
            className={twMerge(
              'fixed bottom-2 w-screen max-w-4xl p-6 -translate-x-1/2 left-1/2 rounded-xl z-20',
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
                {selectedBlueprintCount}{' '}
                {pluralize('blueprint', selectedBlueprintCount > 1)} selected
              </p>

              <Button variant="link" onClick={() => setRowSelection({})}>
                Clear
              </Button>
            </div>

            <Button onClick={() => setIsDrawerOpen(true)}>Register</Button>
          </motion.div>
        )}
      </AnimatePresence>

      <RegistrationDrawer
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        blueprints={selectedBlueprints}
        onRemoveBlueprint={handleRemoveBlueprint}
        onRegistrationComplete={handleRegistrationComplete}
      />
    </div>
  );
};

export default Page;
