'use client';

import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, ExternalLinkLine } from '@webb-tools/icons';
import {
  Avatar,
  Button,
  Card,
  CheckBox,
  FileUploadArea,
  Progress,
  Table,
  Typography,
  shortenHex,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { WEBB_DOCS_URL } from '@webb-tools/webb-ui-components/constants';
import assert from 'assert';
import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { RelativePageUrl } from '../../utils';
import { requestProofGeneration } from '../../utils/api';
import { ColumnKey, Location, Plan } from './types';

export const ProofGenerationStepCards: FC = () => {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [mpcParticipants, setMpcParticipants] = useState<string[]>([]);
  const [r1csFile, setR1csFile] = useState<File | null>(null);
  const [provingKeyFile, setProvingKeyFile] = useState<File | null>(null);

  const [verificationKeyFile, setVerificationKeyFile] = useState<File | null>(
    null
  );

  const { notificationApi } = useWebbUI();

  const handleNextStep = useCallback(
    async (isLast: boolean) => {
      if (!isLast) {
        setStep((current) => current + 1);

        return;
      }

      // If we are on the last step, we should not increment the step,
      // but instead initialize the proof generation.

      assert(
        selectedPlan !== null,
        'Selected plan should have been selected when the proof generation is initialized'
      );

      assert(
        mpcParticipants.length > 0,
        'At least one MPC participant should be selected when the proof generation is initialized'
      );

      assert(
        r1csFile !== null,
        'R1CS file should have been uploaded when the proof generation is initialized'
      );

      assert(
        provingKeyFile !== null,
        'Proving key file should have been uploaded when the proof generation is initialized'
      );

      assert(
        verificationKeyFile !== null,
        'Verification key file should have been uploaded when the proof generation is initialized'
      );

      const response = await requestProofGeneration({
        plan: selectedPlan,
        mpcParticipants,
        provingKey: provingKeyFile,
        r1cs: r1csFile,
        verificationKey: verificationKeyFile,
      });

      // TODO: This is temporary. Consider showing a toast, modal, or redirecting to a new page after a response is received from the backend.
      if (response.isSuccess) {
        alert('Proof generation has been initialized successfully!');
        window.open(RelativePageUrl.Dashboard, '_self');
      } else {
        notificationApi({
          variant: 'error',
          message: `Proof generation has failed to initialize: ${response.errorMessage}`,
        });
      }
    },
    [
      mpcParticipants,
      notificationApi,
      provingKeyFile,
      r1csFile,
      selectedPlan,
      verificationKeyFile,
    ]
  );

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

  const handleFileUpload = useCallback(
    (setter: Dispatch<SetStateAction<File | null>>) => {
      return (acceptedFiles: File[]) => {
        assert(acceptedFiles.length === 1, 'Only one file should be uploaded');

        const uploadedFile = acceptedFiles[0];

        setter(uploadedFile);
      };
    },
    []
  );

  return (
    <div className="flex flex-col gap-6 flex-grow">
      <StepCard
        title="Process R1SC File"
        number={1}
        activeStep={step}
        isNextButtonDisabled={r1csFile === null}
        onNext={handleNextStep}
      >
        <FileUploadArea
          acceptType="json"
          onDrop={handleFileUpload(setR1csFile)}
        />
      </StepCard>

      <StepCard
        title="Upload Verification Key"
        number={2}
        activeStep={step}
        isNextButtonDisabled={verificationKeyFile === null}
        onNext={handleNextStep}
      >
        <FileUploadArea onDrop={handleFileUpload(setVerificationKeyFile)} />
      </StepCard>

      <StepCard
        title="Upload Proving Key"
        number={3}
        activeStep={step}
        isNextButtonDisabled={provingKeyFile === null}
        onNext={handleNextStep}
      >
        <FileUploadArea onDrop={handleFileUpload(setProvingKeyFile)} />
      </StepCard>

      <StepCard
        title="Select MPC Participants"
        number={4}
        activeStep={step}
        isNextButtonDisabled={mpcParticipants.length === 0}
        onNext={handleNextStep}
      >
        <Table isPaginated={false} tableProps={mpcParticipantsTableProps} />
      </StepCard>

      <StepCard
        title="Select Service Tier"
        number={5}
        activeStep={step}
        isNextButtonDisabled={selectedPlan === null}
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
  activeStep: number;
  title: string;
  children: React.ReactNode;
  isLast?: boolean;
  isNextButtonDisabled: boolean;
  onNext: (isLast: boolean) => void;
};

/** @internal */
const StepCard: FC<StepCardProps> = ({
  number,
  title,
  children,
  activeStep,
  isLast = false,
  isNextButtonDisabled,
  onNext,
}) => {
  return (
    <CollapsibleCard
      isOpen={activeStep === number}
      title={`${number}. ${title}:`}
    >
      <div className="flex flex-col gap-4">
        {children}

        <div className="flex gap-4">
          {/* TODO: Replace with link to more specific docs, when available. */}
          <Button isFullWidth variant="secondary" href={WEBB_DOCS_URL}>
            Learn More
          </Button>

          <Button
            isDisabled={isNextButtonDisabled}
            onClick={() => onNext(isLast)}
            isFullWidth
            variant="primary"
          >
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
  isOpen: boolean;
};

const CollapsibleCard: FC<CollapsibleCardProps> = ({
  title,
  children,
  isOpen,
}) => {
  return (
    <Card className="flex flex-col gap-4 space-y-0 rounded-lg w-full">
      <div className="flex items-center justify-between">
        <Typography variant="body1" fw="normal" className="dark:text-mono-0">
          {title}
        </Typography>

        {isOpen ? <ChevronUp size="lg" /> : <ChevronDown size="lg" />}
      </div>

      {isOpen && children}
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
