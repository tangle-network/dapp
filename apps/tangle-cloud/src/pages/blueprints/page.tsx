import { RowSelectionState } from '@tanstack/table-core';
import {
  Button,
  Card,
  CardContent,
} from '@tangle-network/sandbox-ui/primitives';
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
import { StatRow } from '../../components/stats/Stat';

const BLUEPRINT_DOCS_LINK =
  'https://docs.tangle.tools/developers/blueprints/introduction';

const ROLE_TITLE = {
  [Role.OPERATOR]: 'Blueprints',
  [Role.DEPLOYER]: 'Blueprints',
} satisfies Record<Role, string>;

const ROLE_DESCRIPTION = {
  [Role.OPERATOR]:
    'Find blueprints, create service instances, or register operator capacity.',
  [Role.DEPLOYER]:
    'Find blueprints, create service instances, or register operator capacity.',
} satisfies Record<Role, string>;

const HAS_BLUEPRINTS_TITLE = 'Blueprints';
const HAS_BLUEPRINTS_DESCRIPTION =
  'Find blueprints, create service instances, or register operator capacity.';

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

  // Catalog supply/demand split: blueprints that already have operator
  // capacity (deployable today) vs the ones still recruiting. This is the
  // signal a deployer actually wants to see on the catalog landing.
  const blueprintList = useMemo(
    () => Array.from(blueprints.values()),
    [blueprints],
  );
  const readyToDeployCount = blueprintList.filter(
    (b) => (b.operatorsCount ?? 0) > 0,
  ).length;
  const needsCapacityCount = blueprintList.length - readyToDeployCount;

  return (
    <div className="space-y-6">
      <Card
        variant="sandbox"
        className="cloud-hero-card cloud-compact-header overflow-hidden"
      >
        <CardContent className="relative p-4 md:p-5">
          <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_12%_8%,rgba(99,102,241,0.22),transparent_32%),radial-gradient(circle_at_86%_12%,rgba(16,185,129,0.12),transparent_28%)]" />

          <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(380px,460px)] xl:items-center">
            <div>
              <h1 className="max-w-4xl font-display font-extrabold text-3xl text-foreground leading-[1.05] tracking-[-0.035em] sm:text-4xl">
                {hasOwnedBlueprints ? HAS_BLUEPRINTS_TITLE : ROLE_TITLE[role]}
              </h1>

              <p className="mt-3 max-w-2xl text-muted-foreground text-sm leading-relaxed">
                {hasOwnedBlueprints
                  ? HAS_BLUEPRINTS_DESCRIPTION
                  : ROLE_DESCRIPTION[role]}
              </p>

              <StatRow
                className="mt-5 max-w-2xl"
                items={[
                  {
                    label: 'Catalog',
                    value: blueprintList.length,
                    sublabel: 'Indexed blueprints',
                  },
                  {
                    label: 'Ready to deploy',
                    value: readyToDeployCount,
                    tone: readyToDeployCount > 0 ? 'success' : 'default',
                    sublabel: 'Has operator capacity',
                  },
                  {
                    label: 'Needs capacity',
                    value: needsCapacityCount,
                    tone: needsCapacityCount > 0 ? 'warning' : 'default',
                    sublabel: 'Operators wanted',
                  },
                  {
                    label: 'Your registrations',
                    value: ownedBlueprints?.length ?? 0,
                    tone: hasOwnedBlueprints ? 'accent' : 'default',
                    sublabel: role === Role.OPERATOR ? 'Operator' : 'Deployer',
                  },
                ]}
              />
            </div>

            <div className="rounded-lg border border-[color:var(--border-accent)] bg-[var(--accent-surface-soft)] p-4 shadow-[var(--shadow-card)]">
              <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">
                {hasOwnedBlueprints ? 'Manage' : 'Get started'}
              </p>
              <p className="mt-2 font-display font-bold text-foreground text-base leading-snug">
                {hasOwnedBlueprints
                  ? 'You publish or operate blueprints on Tangle.'
                  : 'Deploy a service or supply operator capacity.'}
              </p>
              <p className="mt-2 text-muted-foreground text-xs leading-relaxed">
                {hasOwnedBlueprints
                  ? 'Review registrations, versions, and operator capacity.'
                  : 'Filter the catalog below for ready-to-deploy blueprints, or register capacity for ones recruiting operators.'}
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button variant="sandbox" asChild className="flex-1">
                  <a
                    href={
                      hasOwnedBlueprints
                        ? PagePath.BLUEPRINTS_MANAGE
                        : BLUEPRINT_DOCS_LINK
                    }
                    target={hasOwnedBlueprints ? undefined : '_blank'}
                    rel={hasOwnedBlueprints ? undefined : 'noreferrer'}
                  >
                    {hasOwnedBlueprints
                      ? 'Manage blueprints'
                      : 'Publish blueprint'}
                  </a>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link to={PagePath.OPERATORS}>Browse operators</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
