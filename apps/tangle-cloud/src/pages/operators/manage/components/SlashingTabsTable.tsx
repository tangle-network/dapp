import { SlashProposal } from '@tangle-network/tangle-shared-ui/data/graphql';
import {
  Button,
  Card,
  TabContent,
  Typography,
} from '@tangle-network/ui-components';
import { TableAndChartTabs } from '@tangle-network/ui-components/components/TableAndChartTabs';
import { useReactTable } from '@tanstack/react-table';
import { TangleCloudTable } from '../../../../components/tangleCloudTable/TangleCloudTable';
import { SLASHING_TAB_ICONS, SLASHING_TABS, SlashingTab } from '../constants';

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
        <Typography variant="h5" fw="bold">
          Slashing Management
        </Typography>
        <Button variant="secondary" onClick={onOpenProposeModal}>
          New Proposal
        </Button>
      </div>

      {executeError ? (
        <Card className="p-3 border border-red-500/30 bg-red-500/10">
          <div className="flex items-center justify-between gap-3">
            <Typography
              variant="body2"
              className="text-red-70 dark:text-red-50"
            >
              {executeError}
            </Typography>
            <Button variant="utility" size="sm" onClick={onDismissExecuteError}>
              Dismiss
            </Button>
          </div>
        </Card>
      ) : null}

      <TableAndChartTabs
        tabs={SLASHING_TABS}
        icons={SLASHING_TAB_ICONS}
        value={selectedSlashingTab}
        onValueChange={(tab) => onSlashingTabChange(tab as SlashingTab)}
        className="space-y-5"
        enableAdvancedDivider
      >
        <TabContent value={SlashingTab.MY_PROPOSALS}>
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
        </TabContent>

        <TabContent value={SlashingTab.AGAINST_ME}>
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
        </TabContent>
      </TableAndChartTabs>
    </Card>
  );
};

export default SlashingTabsTable;
