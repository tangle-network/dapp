import { PlusIcon } from '@radix-ui/react-icons';
import { RowSelectionState } from '@tanstack/table-core';
import RestakeBanner from '@tangle-network/tangle-shared-ui/components/blueprints/RestakeBanner';
import {
  useAllBlueprints,
  useBlueprintsByOwner,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import {
  Modal,
  ModalTrigger,
} from '@tangle-network/ui-components/components/Modal';
import { Typography } from '@tangle-network/ui-components';
import { BLUEPRINT_DOCS_LINK } from '@tangle-network/ui-components/constants/tangleDocs';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import { AnimatePresence, motion } from 'framer-motion';
import { FC, useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import useRoleStore, { Role } from '../../stores/roleStore';
import BlueprintListing from './BlueprintListing';
import ConfigureBlueprintModal from './ConfigureBlueprintModal';
import { BlueprintFormResult } from './ConfigureBlueprintModal/types';
import { useNavigate } from 'react-router';
import { SessionStorageKey } from '../../constants';
import { PagePath } from '../../types';
import useOperatorInfo from '@tangle-network/tangle-shared-ui/hooks/useOperatorInfo';

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
  const navigate = useNavigate();
  const role = useRoleStore((store) => store.role);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState(false);
  const { blueprints, isLoading, error } = useAllBlueprints();
  const { data: ownedBlueprints } = useBlueprintsByOwner();

  const { isOperator } = useOperatorInfo();

  const hasOwnedBlueprints =
    ownedBlueprints !== undefined && ownedBlueprints.length > 0;

  const selectedBlueprints = useMemo(() => {
    return (
      Object.keys(rowSelection)
        .filter((blueprintId) => rowSelection[blueprintId])
        .map((blueprintId) => blueprints.get(blueprintId))
        // TODO: Is this filter necessary? The type system doesn't show that this can be undefined at this point.
        .filter((blueprint) => blueprint !== undefined)
    );
  }, [blueprints, rowSelection]);

  const selectedBlueprintCount = Object.keys(selectedBlueprints).length;

  const handleBlueprintFormSubmit = useCallback(
    (result: BlueprintFormResult) => {
      sessionStorage.setItem(
        SessionStorageKey.BLUEPRINT_REGISTRATION_PARAMS,
        JSON.stringify({
          rpcUrl: result.rpcUrl,
          selectedBlueprints: result.blueprints.map((blueprint) => ({
            ...blueprint,
            id: blueprint.id.toString(),
          })),
        }),
      );

      navigate(PagePath.BLUEPRINTS_REGISTRATION_REVIEW);
    },
    [navigate],
  );

  return (
    <div className="space-y-5">
      <RestakeBanner
        title={hasOwnedBlueprints ? HAS_BLUEPRINTS_TITLE : ROLE_TITLE[role]}
        description={
          hasOwnedBlueprints ? HAS_BLUEPRINTS_DESCRIPTION : ROLE_DESCRIPTION[role]
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

        <Link to={PagePath.BLUEPRINTS_CREATE}>
          <Button leftIcon={<PlusIcon className="w-4 h-4" />}>
            Create Blueprint
          </Button>
        </Link>
      </div>

      <BlueprintListing
        blueprints={blueprints}
        isLoading={isLoading}
        error={error}
        rowSelection={isOperator ? rowSelection : undefined}
        onRowSelectionChange={isOperator ? setRowSelection : undefined}
      />

      <Modal open={isBlueprintModalOpen} onOpenChange={setIsBlueprintModalOpen}>
        <AnimatePresence>
          {selectedBlueprintCount > 0 && (
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
                  {selectedBlueprintCount}{' '}
                  {pluralize('blueprint', selectedBlueprintCount > 1)} selected
                </p>

                <Button variant="link" onClick={() => setRowSelection({})}>
                  Clear
                </Button>
              </div>

              <ModalTrigger asChild>
                <Button>Register</Button>
              </ModalTrigger>
            </motion.div>
          )}
        </AnimatePresence>

        <ConfigureBlueprintModal
          onOpenChange={setIsBlueprintModalOpen}
          blueprints={selectedBlueprints}
          onSubmit={handleBlueprintFormSubmit}
        />
      </Modal>
    </div>
  );
};

export default Page;
