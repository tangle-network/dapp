import { RowSelectionState } from '@tanstack/table-core';
import {
  useAllBlueprints,
  useBlueprintsByOwner,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import useOperatorInfo from '@tangle-network/tangle-shared-ui/hooks/useOperatorInfo';
import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { Button } from '@tangle-network/ui-components';
import { AnimatePresence, motion } from 'framer-motion';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { twMerge } from 'tailwind-merge';
import { PagePath } from '../../types';
import pollWithBackoff from '../../utils/pollWithBackoff';
import BlueprintListing from './BlueprintListing';
import RegistrationDrawer from './RegistrationDrawer';

const BLUEPRINT_DOCS_LINK =
  'https://docs.tangle.tools/developers/blueprints/introduction';

const pluralize = (label: string, count: number) =>
  count === 1 ? label : `${label}s`;

const Page: FC = () => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { blueprints, isLoading, error, refetch } = useAllBlueprints();
  const { data: ownedBlueprints } = useBlueprintsByOwner();

  const { isOperator } = useOperatorInfo();

  const hasOwnedBlueprints =
    ownedBlueprints !== undefined && ownedBlueprints.length > 0;

  const selectedBlueprints = useMemo(() => {
    return Object.keys(rowSelection)
      .filter((blueprintId) => rowSelection[blueprintId])
      .map((blueprintId) => blueprints.get(blueprintId))
      .filter((blueprint) => blueprint !== undefined);
  }, [blueprints, rowSelection]);

  const selectedBlueprintCount = selectedBlueprints.length;

  const handleRegisterBlueprint = useCallback((blueprint: Blueprint) => {
    setRowSelection({ [blueprint.id.toString()]: true });
    setIsDrawerOpen(true);
  }, []);

  const requestedRegistrationId = searchParams.get('register');

  useEffect(() => {
    if (!requestedRegistrationId) {
      return;
    }

    const blueprint = blueprints.get(requestedRegistrationId);
    if (!blueprint) {
      return;
    }

    queueMicrotask(() => {
      handleRegisterBlueprint(blueprint);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('register');
      setSearchParams(nextParams, { replace: true });
    });
  }, [
    blueprints,
    handleRegisterBlueprint,
    requestedRegistrationId,
    searchParams,
    setSearchParams,
  ]);

  const handleRegistrationComplete = useCallback(
    async (options?: { expectOperatorCountChange?: boolean }) => {
      // Capture current operator counts before clearing selection.
      const previousCounts = new Map<string, number>();
      for (const bp of selectedBlueprints) {
        previousCounts.set(bp.id.toString(), bp.operatorsCount ?? 0);
      }

      setRowSelection({});
      setIsDrawerOpen(false);

      // Pre-registration emits an intent event but does not change the operator
      // count, so polling the indexed operator count would only delay the UI.
      if (options?.expectOperatorCountChange === false) {
        return;
      }

      // Poll with exponential backoff until indexer reflects the new registration
      await pollWithBackoff(async () => {
        const refetchResult = (await refetch()) as {
          data?: typeof blueprints;
        };
        const latestBlueprints = refetchResult.data;

        if (!latestBlueprints) {
          return false;
        }

        // Check if any of the registered blueprints have increased operator count
        for (const [id, previousCount] of previousCounts) {
          const currentBlueprint = latestBlueprints.get(id);
          const currentCount = currentBlueprint?.operatorsCount ?? 0;

          if (currentCount > previousCount) {
            return true;
          }
        }

        return false;
      });
    },
    [refetch, selectedBlueprints],
  );

  const handleRegistrationOpenChange = useCallback(
    (nextIsOpen: boolean) => {
      setIsDrawerOpen(nextIsOpen);

      if (!nextIsOpen) {
        setRowSelection({});
        if (requestedRegistrationId) {
          const nextParams = new URLSearchParams(searchParams);
          nextParams.delete('register');
          setSearchParams(nextParams, { replace: true });
        }
      }
    },
    [requestedRegistrationId, searchParams, setSearchParams],
  );

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

  const toolbarAction = hasOwnedBlueprints ? (
    <Button
      variant="secondary"
      size="sm"
      className="px-5"
      onClick={() => navigate(PagePath.BLUEPRINTS_MANAGE)}
    >
      Manage
    </Button>
  ) : (
    <Button
      as="a"
      variant="primary"
      size="sm"
      className="px-5"
      href={BLUEPRINT_DOCS_LINK}
      target="_blank"
      rel="noreferrer"
    >
      Publish
    </Button>
  );

  return (
    <div className="space-y-4">
      <BlueprintListing
        blueprints={blueprints}
        isLoading={isLoading}
        error={error}
        rowSelection={isOperator ? rowSelection : undefined}
        onRowSelectionChange={isOperator ? setRowSelection : undefined}
        onRegisterBlueprint={handleRegisterBlueprint}
        toolbarAction={toolbarAction}
        onRetry={() => void refetch()}
      />

      <AnimatePresence>
        {selectedBlueprintCount > 0 && !isDrawerOpen && (
          <motion.div
            className={twMerge(
              'fixed bottom-4 w-[calc(100vw-2rem)] max-w-4xl p-4 -translate-x-1/2 left-1/2 rounded-lg z-20',
              'flex items-center justify-between',
              'border border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-180 shadow-[var(--shadow-dropdown)]',
            )}
            initial={{ opacity: 0, bottom: -100 }}
            animate={{ opacity: 1, bottom: 16 }}
            exit={{ opacity: 0, bottom: -100 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-4">
              <p className="font-bold text-mono-200 dark:text-mono-0 text-sm">
                {selectedBlueprintCount}{' '}
                {pluralize('blueprint', selectedBlueprintCount)} selected
              </p>

              <Button
                variant="link"
                size="sm"
                onClick={() => setRowSelection({})}
              >
                Clear
              </Button>
            </div>

            <Button variant="primary" onClick={() => setIsDrawerOpen(true)}>
              Add capacity
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <RegistrationDrawer
        isOpen={isDrawerOpen}
        onOpenChange={handleRegistrationOpenChange}
        blueprints={selectedBlueprints}
        onRemoveBlueprint={handleRemoveBlueprint}
        onRegistrationComplete={handleRegistrationComplete}
      />
    </div>
  );
};

export default Page;
