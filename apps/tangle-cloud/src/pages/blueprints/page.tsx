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

const BLUEPRINT_DOCS_LINK =
  'https://docs.tangle.tools/developers/blueprints/introduction';

const ROLE_TITLE = {
  [Role.OPERATOR]: 'Blueprints',
  [Role.DEPLOYER]: 'Blueprints',
} satisfies Record<Role, string>;

const ROLE_DESCRIPTION = {
  [Role.OPERATOR]:
    'Deploy service instances or register operator capacity for indexed blueprints.',
  [Role.DEPLOYER]:
    'Deploy service instances or register operator capacity for indexed blueprints.',
} satisfies Record<Role, string>;

const HAS_BLUEPRINTS_TITLE = 'Blueprints';
const HAS_BLUEPRINTS_DESCRIPTION =
  'Deploy service instances or register operator capacity for indexed blueprints.';

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

  const handleRegistrationComplete = useCallback(async () => {
    // Capture current operator counts before clearing selection
    const previousCounts = new Map<string, number>();
    for (const bp of selectedBlueprints) {
      previousCounts.set(bp.id.toString(), bp.operatorsCount ?? 0);
    }

    setRowSelection({});
    setIsDrawerOpen(false);

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
  }, [refetch, selectedBlueprints]);

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
    <div className="space-y-8">
      <Card
        variant="sandbox"
        className="overflow-hidden border-border bg-card shadow-[var(--shadow-card)]"
      >
        <CardContent className="relative p-6 md:p-8">
          <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_12%_8%,rgba(99,102,241,0.22),transparent_32%),radial-gradient(circle_at_86%_12%,rgba(16,185,129,0.12),transparent_28%)]" />

          <div className="relative grid gap-8 xl:grid-cols-[1fr_360px] xl:items-end">
            <div>
              <h1 className="max-w-4xl font-display font-extrabold text-4xl text-foreground leading-[0.92] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                {hasOwnedBlueprints ? HAS_BLUEPRINTS_TITLE : ROLE_TITLE[role]}
              </h1>

              <p className="mt-5 max-w-2xl text-muted-foreground text-sm leading-relaxed sm:text-base">
                {hasOwnedBlueprints
                  ? HAS_BLUEPRINTS_DESCRIPTION
                  : ROLE_DESCRIPTION[role]}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4 shadow-[var(--shadow-card)]">
              <div className="grid grid-cols-3 gap-3">
                <HeroMetric label="Catalog" value={blueprints.size} />
                <HeroMetric
                  label="Owned"
                  value={ownedBlueprints?.length ?? 0}
                />
                <HeroMetric
                  label="Role"
                  value={role === Role.OPERATOR ? 'Operator' : 'Deployer'}
                />
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row xl:flex-col">
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
                    {hasOwnedBlueprints ? 'Manage blueprints' : 'Read docs'}
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

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-foreground tracking-tight">
            Catalog
          </h2>
          <p className="mt-1 text-muted-foreground text-sm">
            Search by workload, capacity, publisher, or blueprint ID.
          </p>
        </div>

        {isOperator && (
          <span className="text-muted-foreground text-sm">
            Select blueprints to register.
          </span>
        )}
      </div>

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
        onOpenChange={setIsDrawerOpen}
        blueprints={selectedBlueprints}
        onRemoveBlueprint={handleRemoveBlueprint}
        onRegistrationComplete={handleRegistrationComplete}
      />
    </div>
  );
};

export default Page;

const HeroMetric = ({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) => (
  <div className="rounded-md border border-border bg-card/70 p-3">
    <p className="font-medium text-muted-foreground text-[10px] uppercase tracking-wider">
      {label}
    </p>
    <p className="mt-1 font-display font-extrabold text-foreground text-xl">
      {value}
    </p>
  </div>
);
