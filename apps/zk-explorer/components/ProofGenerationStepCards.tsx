'use client';

import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ExternalLinkLine } from '@webb-tools/icons';
import {
  Avatar,
  Button,
  Card,
  CheckBox,
  Collapsible,
  CollapsibleButton,
  CollapsibleContent,
  FileUploadArea,
  Progress,
  Table,
  Typography,
  shortenHex,
} from '@webb-tools/webb-ui-components';
import { WEBB_DOCS_URL } from '@webb-tools/webb-ui-components/constants';
import { useRouter } from 'next/navigation';
import { FC, useCallback, useMemo, useState } from 'react';

enum Plan {
  Free = 'Free',
  Pro = 'Pro',
  Enterprise = 'Enterprise',
}

enum Location {
  UsWest = 'US West',
  EuCentral = 'EU Central',
  AsiaEast = 'Asia East',
}

enum ColumnKey {
  IsChecked = 'isChecked',
  Identity = 'identity',
  Location = 'location',
  SlashingIncidents = 'slashingIncidents',
  Uptime = 'uptime',
}

export const ProofGenerationStepCards: FC = () => {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const router = useRouter();

  const handleNextStep = useCallback(() => {
    setStep((current) => current + 1);
  }, []);

  const getColumnKeyAsTitle = useCallback((key: ColumnKey): string => {
    switch (key) {
      case ColumnKey.IsChecked:
        return 'Select';
      case ColumnKey.Identity:
        return 'Identity';
      case ColumnKey.Location:
        return 'Location';
      case ColumnKey.SlashingIncidents:
        return 'Slashing Incidents';
      case ColumnKey.Uptime:
        return 'Uptime';
    }
  }, []);

  const columnHelper = createColumnHelper<RowData>();

  const columns: ColumnDef<RowData, any>[] = useMemo(
    () => [
      columnHelper.accessor(ColumnKey.IsChecked, {
        header: getColumnKeyAsTitle(ColumnKey.IsChecked),
        cell: (props) => (
          <CheckBox inputProps={{ readOnly: true }} isChecked={true} />
        ),
      }),
      columnHelper.accessor(ColumnKey.Identity, {
        header: getColumnKeyAsTitle(ColumnKey.Identity),
        cell: (props) => (
          <IdentityItem address="0x123456789" avatarUrl="./pending.png" />
        ),
      }),
      columnHelper.accessor(ColumnKey.Location, {
        header: getColumnKeyAsTitle(ColumnKey.Location),
        cell: (props) => props.getValue(),
      }),
      columnHelper.accessor(ColumnKey.SlashingIncidents, {
        header: getColumnKeyAsTitle(ColumnKey.SlashingIncidents),
        cell: (props) => props.getValue(),
      }),
      columnHelper.accessor(ColumnKey.Uptime, {
        header: getColumnKeyAsTitle(ColumnKey.Uptime),
        cell: (props) => (
          <Progress
            suffixLabel="%"
            className="max-h-7"
            size="lg"
            value={99.3}
          />
        ),
      }),
    ],
    [columnHelper, getColumnKeyAsTitle]
  );

  const data: RowData[] = useMemo(
    () => [
      {
        [ColumnKey.IsChecked]: false,
        [ColumnKey.Identity]: '0x123...456',
        [ColumnKey.Location]: Location.UsWest,
        [ColumnKey.SlashingIncidents]: 0,
        [ColumnKey.Uptime]: 100,
      },
      {
        [ColumnKey.IsChecked]: false,
        [ColumnKey.Identity]: '0x123...456',
        [ColumnKey.Location]: Location.EuCentral,
        [ColumnKey.SlashingIncidents]: 0,
        [ColumnKey.Uptime]: 100,
      },
      {
        [ColumnKey.IsChecked]: false,
        [ColumnKey.Identity]: '0x123...456',
        [ColumnKey.Location]: Location.AsiaEast,
        [ColumnKey.SlashingIncidents]: 0,
        [ColumnKey.Uptime]: 100,
      },
    ],
    []
  );

  const mpcParticipantsTableProps = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    filterFns: {
      // TODO: Handle this.
      fuzzy: (value, search) => false,
    },
  });

  const handlePlanSelection = useCallback((plan: Plan) => {
    // The enterprise plan requires a contact form,
    // so it is handled separately.
    if (plan === Plan.Enterprise) {
      setSelectedPlan(null);

      // TODO: Need to change this to a contact form when available.
      const CONTACT_HREF = 'mailto:hello@webb.tools';

      window.open(CONTACT_HREF, '_blank', 'noopener noreferrer');

      return;
    }

    setSelectedPlan(plan);
  }, []);

  return (
    <div className="flex flex-col gap-6 flex-grow">
      <StepCard title="Process R1SC File" number={1} onNext={handleNextStep}>
        <FileUploadArea />
      </StepCard>

      <StepCard
        title="Upload Verification Key"
        number={2}
        onNext={handleNextStep}
      >
        <FileUploadArea />
      </StepCard>

      <StepCard title="Upload Proving Key" number={3} onNext={handleNextStep}>
        <FileUploadArea />
      </StepCard>

      <StepCard
        title="Select MPC Participants"
        number={4}
        onNext={handleNextStep}
      >
        <Table isPaginated={false} tableProps={mpcParticipantsTableProps} />
      </StepCard>

      <StepCard
        title="Select Service Tier"
        number={5}
        onNext={handleNextStep}
        isLast
      >
        <div className="flex flex-col gap-4">
          <ServiceTierCard
            onSelect={handlePlanSelection}
            plan={Plan.Free}
            isSelected={selectedPlan === Plan.Free}
            description="New users, small-scale projects, or those wanting to test the waters."
            monthlyPrice={0}
            benefits={[
              'Proofs Generated: Limited number (e.g., up to X proofs/month).',
              'Execution Time: Standard processing speed.',
              'Suitable for experimentation and learning.',
            ]}
          />

          <ServiceTierCard
            onSelect={handlePlanSelection}
            plan={Plan.Pro}
            isSelected={selectedPlan === Plan.Pro}
            description="Medium-scale projects, businesses, and frequent users."
            monthlyPrice={349}
            benefits={[
              'Proofs Generated: Enhanced limit (e.g., up to X proofs/month).',
              'Execution Time: Prioritized processing speed.',
              'Best for regular usage without hefty commitments.',
            ]}
          />

          <ServiceTierCard
            onSelect={handlePlanSelection}
            plan={Plan.Enterprise}
            description="Large-scale projects, enterprises, and those needing premium features."
            monthlyPrice={null}
            benefits={[
              'Proofs Generated: Unlimited or very high limit (e.g., up to X proofs/month).',
              'Execution Time: Premium processing speed with priority queuing.',
              'Suitable for businesses with high demands and scalability needs.',
            ]}
          />
        </div>
      </StepCard>
    </div>
  );
};

type StepCardProps = {
  number: number;
  title: string;
  children: React.ReactNode;
  isLast?: boolean;
  onNext: () => void;
};

/** @internal */
const StepCard: FC<StepCardProps> = ({
  number,
  title,
  children,
  isLast = false,
  onNext,
}) => {
  return (
    <CollapsibleCard title={`${number}. ${title}:`}>
      <div className="flex flex-col gap-4">
        {children}

        <div className="flex gap-4">
          {/* TODO: Replace with link to more specific docs, when available. */}
          <Button isFullWidth variant="secondary" href={WEBB_DOCS_URL}>
            Learn More
          </Button>

          <Button onClick={onNext} isFullWidth variant="primary">
            {isLast ? 'Initialize Proof Generation' : 'Next'}
          </Button>
        </div>
      </div>
    </CollapsibleCard>
  );
};

type CollapsibleCardProps = {
  title: string;
  children: React.ReactNode;
};

const CollapsibleCard: FC<CollapsibleCardProps> = ({ title, children }) => {
  return (
    <Card className="space-y-0 rounded-2xl w-full">
      <Collapsible>
        <CollapsibleButton>
          <Typography variant="body1" fw="normal" className="dark:text-mono-0">
            {title}
          </Typography>
        </CollapsibleButton>

        <CollapsibleContent>{children}</CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

type IdentityItemProps = {
  address: string;
  avatarUrl: string;
};

/** @internal */
const IdentityItem: FC<IdentityItemProps> = ({ address, avatarUrl }) => {
  return (
    <a
      href={WEBB_DOCS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-1 items-center"
    >
      <Avatar src={avatarUrl} />

      {shortenHex(address)}

      <ExternalLinkLine />
    </a>
  );
};

type RowData = {
  [ColumnKey.IsChecked]: boolean;
  [ColumnKey.Identity]: string;
  [ColumnKey.Location]: Location;
  [ColumnKey.SlashingIncidents]: number;
  [ColumnKey.Uptime]: number;
};

type ServiceTierCardProps = {
  plan: Plan;
  description: string;
  benefits: string[];
  monthlyPrice: number | null;
  isSelected?: boolean;
  onSelect: (plan: Plan) => void;
};

const ServiceTierCard: FC<ServiceTierCardProps> = ({
  plan,
  monthlyPrice,
  description,
  benefits,
  isSelected = false,
  onSelect,
}) => {
  const billingText =
    monthlyPrice === null
      ? null
      : monthlyPrice > 0
      ? `Billed $${monthlyPrice * 12}/year`
      : 'Free';

  return (
    <Card className="flex flex-col gap-1 space-y-0 rounded-2xl w-full dark:bg-mono-160 px-6 py-3">
      <Typography variant="h4" fw="bold" className="dark:text-mono-0">
        {plan}
      </Typography>

      <Typography variant="body1">{description}</Typography>

      {monthlyPrice !== null && (
        <>
          <div className="flex items-center">
            <Typography variant="h4" fw="bold">
              ${monthlyPrice}
            </Typography>

            <Typography variant="body1" fw="normal">
              /mo
            </Typography>
          </div>

          <Typography variant="body1" fw="normal">
            {billingText}
          </Typography>
        </>
      )}

      <ul className="list-disc pl-5">
        {benefits.map((benefit, index) => (
          <li className="list-item" key={index}>
            {benefit}
          </li>
        ))}
      </ul>

      <Button
        isDisabled={isSelected}
        onClick={() => onSelect(plan)}
        className="ml-auto"
        variant={monthlyPrice === null ? 'secondary' : 'primary'}
      >
        {monthlyPrice === null
          ? 'Contact Us'
          : isSelected
          ? 'Selected'
          : 'Select Plan'}
      </Button>
    </Card>
  );
};
