import { CircleIcon } from '@radix-ui/react-icons';
import { CheckboxCircleFill } from '@tangle-network/icons';
import {
  Card,
  isSubstrateAddress,
  KeyValueWithButton,
  Typography,
  ValidatorIdentity,
} from '@tangle-network/ui-components';
import { Row } from '@tanstack/react-table';
import React from 'react';
import { Account } from '../types';
import { formatDisplayBlockNumber } from '../utils/formatDisplayBlockNumber';

interface ExpandedInfoProps {
  row: Row<Account>;
}

export const ExpandedInfo: React.FC<ExpandedInfoProps> = ({ row }) => {
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
      <Typography variant="h5" component="h3" className="font-semibold">
        {title}
      </Typography>
      <div className="space-y-2">{children}</div>
    </div>
  );

  const { testnetTaskCompletion } = account;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 pb-4">
      <Card className="bg-mono-40/80 dark:bg-mono-0/5 space-y-4 border-0">
        <Section title="Account Details">
          <DetailRow
            label="Account ID"
            value={
              isSubstrateAddress(address) ? (
                <ValidatorIdentity address={address} />
              ) : (
                <KeyValueWithButton size="sm" keyValue={address} />
              )
            }
          />
          <DetailRow
            label="Created"
            value={formatDisplayBlockNumber(
              account.createdAt,
              account.createdAtTimestamp,
            )}
          />
          <DetailRow
            label="Last Updated"
            value={formatDisplayBlockNumber(
              account.lastUpdatedAt,
              account.lastUpdatedAtTimestamp,
            )}
          />
        </Section>

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
      </Card>

      <Card className="bg-mono-40/80 dark:bg-mono-0/5 space-y-4 border-0">
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

        <div className="space-y-2">
          <Typography variant="h5" component="h3" className="font-semibold">
            Testnet Task Completion
          </Typography>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <TaskIndicator
                completed={testnetTaskCompletion?.depositedThreeAssets}
                label="Deposit 3+ Assets"
              />
              <TaskIndicator
                completed={testnetTaskCompletion?.delegatedAssets}
                label="Delegation"
              />
              <TaskIndicator
                completed={testnetTaskCompletion?.liquidStaked}
                label="Liquid Stake"
              />
              <TaskIndicator
                completed={testnetTaskCompletion?.nominated}
                label="Nomination"
              />
              <TaskIndicator
                completed={testnetTaskCompletion?.nativeRestaked}
                label="Native Restake"
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
