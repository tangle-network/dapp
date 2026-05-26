import { RowSelectionState } from '@tanstack/table-core';
import { Button } from '@tangle-network/sandbox-ui/primitives';
import {
  useAllBlueprints,
  useBlueprintsByOwner,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import useOperatorInfo from '@tangle-network/tangle-shared-ui/hooks/useOperatorInfo';
import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { AnimatePresence, motion } from 'framer-motion';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { twMerge } from 'tailwind-merge';
import useRoleStore, { Role } from '../../stores/roleStore';
import { PagePath } from '../../types';
import pollWithBackoff from '../../utils/pollWithBackoff';
import BlueprintListing from './BlueprintListing';
import RegistrationDrawer from './RegistrationDrawer';
import { PageHeader } from '../../components/chrome';

const BLUEPRINT_DOCS_LINK =
  'https://docs.tangle.tools/developers/blueprints/introduction';

const ROLE_TITLE = {
  [Role.OPERATOR]: 'Blueprints',
  [Role.DEPLOYER]: 'Blueprints',
} satisfies Record<Role, string>;

const HAS_BLUEPRINTS_TITLE = 'Blueprints';

const pluralize = (label: string, count: number) =>
  count === 1 ? label : `${label}s`;

const Page: FC = () => {
  const role = useRoleStore((store) => store.role);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
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

    handleRegisterBlueprint(blueprint);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('register');
    setSearchParams(nextParams, { replace: true });
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

  const title = hasOwnedBlueprints ? HAS_BLUEPRINTS_TITLE : ROLE_TITLE[role];
  // No subtitle on a catalog page — the visible content IS the subtitle.
  // Adding "Find blueprints, create service instances, ..." steals 24px of
  // vertical space for copy the operator already knows by being on this
  // page. Catalog tier = title + toolbar + grid, nothing else above content.
  // Catalog-wide stats (total, ready, needs-capacity, your-registrations)
  // belong on the home dashboard, not above a search bar.

  return (
    <div className="space-y-4">
      <PageHeader
        density="compact"
        title={title}
        action={
          <>
            {hasOwnedBlueprints && (
              <Button asChild variant="ghost" size="sm">
                <Link to={PagePath.OPERATORS}>Operators</Link>
              </Button>
            )}
            <Button variant="sandbox" asChild size="sm">
              <a
                href={
                  hasOwnedBlueprints
                    ? PagePath.BLUEPRINTS_MANAGE
                    : BLUEPRINT_DOCS_LINK
                }
                target={hasOwnedBlueprints ? undefined : '_blank'}
                rel={hasOwnedBlueprints ? undefined : 'noreferrer'}
              >
                {hasOwnedBlueprints ? 'Manage blueprints' : 'Publish blueprint'}
              </a>
            </Button>
          </>
        }
      />

      <BlueprintListing
        blueprints={blueprints}
        isLoading={isLoading}
        error={error}
        rowSelection={isOperator ? rowSelection : undefined}
        onRowSelectionChange={isOperator ? setRowSelection : undefined}
        onRegisterBlueprint={handleRegisterBlueprint}
      />

      <AnimatePresence>
        {selectedBlueprintCount > 0 && !isDrawerOpen && (
          <motion.div
            className={twMerge(
              'fixed bottom-4 w-[calc(100vw-2rem)] max-w-4xl p-4 -translate-x-1/2 left-1/2 rounded-lg z-20',
              'flex items-center justify-between',
              'border border-border bg-card shadow-[var(--shadow-dropdown)]',
            )}
            initial={{ opacity: 0, bottom: -100 }}
            animate={{ opacity: 1, bottom: 16 }}
            exit={{ opacity: 0, bottom: -100 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-4">
              <p className="font-bold text-foreground text-sm">
                {selectedBlueprintCount}{' '}
                {pluralize('blueprint', selectedBlueprintCount)} selected
              </p>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRowSelection({})}
              >
                Clear
              </Button>
            </div>

            <Button variant="sandbox" onClick={() => setIsDrawerOpen(true)}>
              Register
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
