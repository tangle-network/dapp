import {
  Card,
  KeyValueWithButton,
  Typography,
} from '@tangle-network/ui-components';
import { Row } from '@tanstack/react-table';
import React from 'react';
import { Account } from '../types';
import { createAccountExplorerUrl } from '../utils/createAccountExplorerUrl';

interface ExpandedInfoProps {
  row: Row<Account>;
}

export const ExpandedInfo: React.FC<ExpandedInfoProps> = ({ row }) => {
  const account = row.original;
  const address = account.id;
  const accountNetwork = account.network;

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 pb-4">
      <Card className="bg-mono-40/80 dark:bg-mono-0/5 space-y-4 border-0">
        <Section title="Account Details">
          <DetailRow
            label="Account"
            value={
              <a
                href={createAccountExplorerUrl(address, accountNetwork)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                <KeyValueWithButton size="sm" keyValue={address} />
              </a>
            }
          />
          {account.updatedAtTimestamp && (
            <DetailRow
              label="Last Updated"
              value={account.updatedAtTimestamp.toLocaleString()}
            />
          )}
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
            label="Liquid Vault Positions"
            value={account.activity.liquidStakingPoolCount}
          />
          <DetailRow
            label="Blueprints Owned"
            value={account.activity.blueprintCount}
          />
          <DetailRow label="Services" value={account.activity.serviceCount} />
          <DetailRow label="Job Calls" value={account.activity.jobCallCount} />
        </Section>
      </Card>
    </div>
  );
};
