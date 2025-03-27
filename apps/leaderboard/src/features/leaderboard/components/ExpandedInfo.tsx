import { CircleIcon } from '@radix-ui/react-icons';
import { CheckboxCircleFill } from '@tangle-network/icons';
import {
  Card,
  KeyValueWithButton,
  Progress,
  Typography,
} from '@tangle-network/ui-components';
import { Row } from '@tanstack/react-table';
import React from 'react';
import { Account } from '../types';
import { formatDisplayBlockNumber } from '../utils/formatDisplayBlockNumber';

interface ExpandedInfoProps {
  row: Row<Account>;
  latestBlockNumber?: number | null;
  latestBlockTimestamp?: Date | null;
}

export const ExpandedInfo: React.FC<ExpandedInfoProps> = ({
  row,
  latestBlockNumber,
  latestBlockTimestamp,
}) => {
  const account = row.original;
  const address = account.id;

  // Helper function to render a detail row with label and value
  const DetailRow = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) => (
    <div className="flex justify-between">
      <span>{label}:</span>
      <span>{value}</span>
    </div>
  );

  // Helper function to render task completion indicator
  const TaskIndicator = ({
    completed,
    label,
  }: {
    completed?: boolean;
    label: string;
  }) => (
    <div className="flex items-center gap-1 [&>svg]:flex-initial">
      {completed ? (
        <CheckboxCircleFill className="fill-green-500 dark:fill-green-400" />
      ) : (
        <CircleIcon />
      )}
      <span>{label}</span>
    </div>
  );

  // Helper function to create a section with title and content
  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="space-y-2">
      <Typography variant="h4" component="h3">
        {title}
      </Typography>
      <div className="space-y-2">{children}</div>
    </div>
  );

  const { testnetTaskCompletion } = account;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 pb-4">
      <Card className="bg-mono-40/50 dark:bg-mono-200 space-y-4">
        <Section title="Account Details">
          <DetailRow
            label="Account ID"
            value={<KeyValueWithButton size="sm" keyValue={address} />}
          />
          <DetailRow
            label="Created"
            value={formatDisplayBlockNumber(
              account.createdAt,
              latestBlockNumber,
              latestBlockTimestamp,
            )}
          />
          <DetailRow
            label="Last Updated"
            value={formatDisplayBlockNumber(
              account.lastUpdatedAt,
              latestBlockNumber,
              latestBlockTimestamp,
            )}
          />
        </Section>

        <Section title="Activity Details">
          <DetailRow label="Deposits" value={account.activity.depositCount} />
          <DetailRow
            label="Delegations"
            value={account.activity.delegationCount}
          />
          <DetailRow
            label="Liquid Staking Pools"
            value={account.activity.liquidStakingPoolCount}
          />
          <DetailRow label="Services" value={account.activity.serviceCount} />
        </Section>
      </Card>

      <Card className="bg-mono-40/50 dark:bg-mono-200 space-y-4">
        <Section title="Points Breakdown">
          <DetailRow
            label="Mainnet Points"
            value={account.pointsBreakdown.mainnet.toLocaleString()}
          />
          <DetailRow
            label="Testnet Points"
            value={account.pointsBreakdown.testnet.toLocaleString()}
          />
          <DetailRow
            label="Last 7 Days"
            value={account.pointsBreakdown.lastSevenDays.toLocaleString()}
          />
        </Section>

        <div className="space-y-2">
          <Typography variant="h4" component="h3">
            Testnet Task Completion
          </Typography>
          <div className="space-y-3">
            <div>
              <Progress
                value={testnetTaskCompletion?.completionPercentage ?? null}
                className="h-2 mb-2"
              />
              <div className="text-sm text-right">
                {testnetTaskCompletion
                  ? Math.round(testnetTaskCompletion.completionPercentage)
                  : 0}
                % Complete
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <TaskIndicator
                completed={testnetTaskCompletion?.depositedThreeAssets}
                label="Deposited 3+ Assets"
              />
              <TaskIndicator
                completed={testnetTaskCompletion?.delegatedAssets}
                label="Delegated Assets"
              />
              <TaskIndicator
                completed={testnetTaskCompletion?.liquidStaked}
                label="Liquid Staked"
              />
              <TaskIndicator
                completed={testnetTaskCompletion?.nominated}
                label="Nominated"
              />
              <TaskIndicator
                completed={testnetTaskCompletion?.nativeRestaked}
                label="Native Restaked"
              />
              <TaskIndicator
                completed={testnetTaskCompletion?.bonus}
                label="Bonus Points"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
