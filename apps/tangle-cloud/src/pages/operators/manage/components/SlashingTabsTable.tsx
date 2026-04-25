import { SlashProposal } from '@tangle-network/tangle-shared-ui/data/graphql';
import {
  Button as SandboxButton,
  Card,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@tangle-network/sandbox-ui/primitives';
import { useReactTable } from '@tanstack/react-table';
import type { ComponentProps, FC } from 'react';
import { TangleCloudTable } from '../../../../components/tangleCloudTable/TangleCloudTable';
import { SLASHING_TABS, SlashingTab } from '../constants';

interface SlashingTabsTableProps {
  selectedSlashingTab: SlashingTab;
  onSlashingTabChange: (tab: SlashingTab) => void;
  onOpenProposeModal: () => void;
  myProposals: SlashProposal[];
  againstMe: SlashProposal[];
  loadingSlash: boolean;
  slashError: Error | null;
  refetchSlashProposals: () => void;
  myProposalsTable: ReturnType<typeof useReactTable<SlashProposal>>;
  againstMeTable: ReturnType<typeof useReactTable<SlashProposal>>;
  executeError: string | null;
  onDismissExecuteError: () => void;
}

type ButtonProps = Omit<
  ComponentProps<typeof SandboxButton>,
  'variant' | 'size'
> & {
  variant?: ComponentProps<typeof SandboxButton>['variant'] | 'utility';
  size?: ComponentProps<typeof SandboxButton>['size'];
};

const Button: FC<ButtonProps> = ({ variant, size, ...props }) => (
  <SandboxButton
    variant={variant === 'utility' ? 'outline' : variant}
    size={size}
    {...props}
  />
);

const SlashingTabsTable = ({
  selectedSlashingTab,
  onSlashingTabChange,
  onOpenProposeModal,
  myProposals,
  againstMe,
  loadingSlash,
  slashError,
  refetchSlashProposals,
  myProposalsTable,
  againstMeTable,
  executeError,
  onDismissExecuteError,
}: SlashingTabsTableProps) => {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display font-bold text-foreground text-xl">
          Slashing Management
        </h2>
        <Button variant="secondary" onClick={onOpenProposeModal}>
          New Proposal
        </Button>
      </div>

      {executeError ? (
        <Card className="p-3 border border-red-500/30 bg-red-500/10">
          <div className="flex items-center justify-between gap-3">
            <p className="text-destructive text-sm">{executeError}</p>
            <Button variant="utility" size="sm" onClick={onDismissExecuteError}>
              Dismiss
            </Button>
          </div>
        </Card>
      ) : null}

      <Tabs
        value={selectedSlashingTab}
        onValueChange={(tab) => onSlashingTabChange(tab as SlashingTab)}
        className="space-y-5"
      >
        <TabsList>
          {SLASHING_TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={SlashingTab.MY_PROPOSALS}>
          <TangleCloudTable
            title="Proposals Created By You"
            hideTitle
            data={myProposals}
            isLoading={loadingSlash}
            error={slashError}
            onRetry={refetchSlashProposals}
            tableProps={myProposalsTable}
            tableConfig={{
              tdClassName: '!px-4 !py-3.5 max-w-none whitespace-nowrap',
              thClassName: 'whitespace-nowrap',
            }}
            loadingTableProps={{
              title: 'Loading proposals...',
              description: 'Fetching slash proposals you created.',
              icon: '🔄',
            }}
            emptyTableProps={{
              title: 'No Proposals Yet',
              description: 'You have not proposed any slash proposals yet.',
              icon: '🧾',
            }}
          />
        </TabsContent>

        <TabsContent value={SlashingTab.AGAINST_ME}>
          <TangleCloudTable
            title="Slashes Against You"
            hideTitle
            data={againstMe}
            isLoading={loadingSlash}
            error={slashError}
            onRetry={refetchSlashProposals}
            tableProps={againstMeTable}
            tableConfig={{
              tdClassName: '!px-4 !py-3.5 max-w-none whitespace-nowrap',
              thClassName: 'whitespace-nowrap',
            }}
            loadingTableProps={{
              title: 'Loading slashes...',
              description:
                'Fetching slash proposals where you are the targeted operator.',
              icon: '🔄',
            }}
            emptyTableProps={{
              title: 'No Slashes Against You',
              description:
                'There are no slash proposals targeting your operator address.',
              icon: '✅',
            }}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default SlashingTabsTable;
