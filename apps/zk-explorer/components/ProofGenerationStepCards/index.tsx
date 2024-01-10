'use client';

import {
  ColumnDef,
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
import { CONTACT_URL } from '../../constants';
import { MOCK_MPC_PARTICIPANTS } from '../../constants/mock';
import { RelativePageUrl } from '../../utils';
import { requestProofGeneration } from '../../utils/api';
import { ColumnKey, Location, MpcParticipant, Plan } from './types';

export type ProofGenerationStepCardsProps = {
  activeStep: number;
  nextStep: () => void;
};

export const ProofGenerationStepCards: FC<ProofGenerationStepCardsProps> = ({
  activeStep,
  nextStep,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [r1csFile, setR1csFile] = useState<File | null>(null);
  const [provingKeyFile, setProvingKeyFile] = useState<File | null>(null);

  // TODO: Need to fetch MPC participants from the backend. Create a request function for this.
  const [mpcParticipants, setMpcParticipants] = useState<MpcParticipant[]>(
    MOCK_MPC_PARTICIPANTS
  );

  const [selectedMpcParticipantAddresses, setSelectedMpcParticipantAddresses] =
    useState<string[]>([]);

  const [verificationKeyFile, setVerificationKeyFile] = useState<File | null>(
    null
  );

  const { notificationApi } = useWebbUI();

  const handleNextStep = useCallback(
    async (isLast: boolean) => {
      if (!isLast) {
        nextStep();

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
      nextStep,
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

  const handleMpcParticipantSelection = useCallback(
    (address: string) => {
      const participant = MOCK_MPC_PARTICIPANTS.find(
        (participant) => participant.address === address
      );

      assert(
        participant !== undefined,
        `MPC participant with address ${address} should exist`
      );

      const isAlreadySelected =
        selectedMpcParticipantAddresses.includes(address);

      if (isAlreadySelected) {
        setSelectedMpcParticipantAddresses((current) =>
          current.filter((address) => address !== participant.address)
        );

        return;
      }

      setSelectedMpcParticipantAddresses((current) => [
        ...current,
        participant.address,
      ]);
    },
    [selectedMpcParticipantAddresses]
  );

  const columns = useMemo<ColumnDef<RowData>[]>(
    () => [
      {
        header: getColumnKeyAsTitle(ColumnKey.IsChecked),
        accessorKey: ColumnKey.IsChecked,
        cell: (props) => (
          <CheckBox
            isChecked={props.row.original[ColumnKey.IsChecked]}
            onChange={() =>
              handleMpcParticipantSelection(
                props.row.original[ColumnKey.Identity]
              )
            }
          />
        ),
      },
      {
        header: getColumnKeyAsTitle(ColumnKey.Identity),
        accessorKey: ColumnKey.Identity,
        cell: (props) => (
          <IdentityItem
            address={props.row.original[ColumnKey.Identity]}
            avatarUrl="./pending.png"
          />
        ),
      },
      {
        header: getColumnKeyAsTitle(ColumnKey.Location),
        accessorKey: ColumnKey.Location,
        cell: (props) => props.getValue(),
      },
      {
        header: getColumnKeyAsTitle(ColumnKey.SlashingIncidents),
        accessorKey: ColumnKey.SlashingIncidents,
        cell: (props) => props.getValue(),
      },
      {
        header: getColumnKeyAsTitle(ColumnKey.Uptime),
        accessorKey: ColumnKey.Uptime,
        cell: (props) => (
          <Progress
            suffixLabel="%"
            className="max-h-7"
            size="lg"
            value={props.row.original[ColumnKey.Uptime]}
          />
        ),
      },
    ],
    [getColumnKeyAsTitle, handleMpcParticipantSelection]
  );

  const convertMpcParticipantToRowData = useCallback(
    (participant: MpcParticipant): RowData => {
      return {
        [ColumnKey.IsChecked]: selectedMpcParticipantAddresses.includes(
          participant.address
        ),
        [ColumnKey.Identity]: participant.address,
        [ColumnKey.Location]: participant.location,
        [ColumnKey.SlashingIncidents]: participant.slashingIncidents,
        [ColumnKey.Uptime]: participant.uptime,
      };
    },
    [selectedMpcParticipantAddresses]
  );

  const rows: RowData[] = useMemo(
    () => mpcParticipants.map(convertMpcParticipantToRowData),
    [convertMpcParticipantToRowData, mpcParticipants]
  );

  const mpcParticipantsTableProps = useReactTable({
    columns,
    data: rows,
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
      window.open(CONTACT_URL, '_blank', 'noopener noreferrer');

      return;
    }

    setSelectedPlan(plan);
  }, []);

  const handleFileUpload = useCallback(
    (setter: Dispatch<SetStateAction<File | null>>) => {
      return (acceptedFiles: File[]) => {
        // The uploaded file was not accepted; reset the state.
        if (acceptedFiles.length === 0) {
          setter(null);

          return;
        }

        assert(
          acceptedFiles.length === 1,
          'Upload file dialog should allow exactly one file to be provided'
        );

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
        activeStep={activeStep}
        isNextButtonDisabled={r1csFile === null}
        onNext={handleNextStep}
      >
        <FileUploadArea onDrop={handleFileUpload(setR1csFile)} />
      </StepCard>

      <StepCard
        title="Upload Verification Key"
        number={2}
        activeStep={activeStep}
        isNextButtonDisabled={verificationKeyFile === null}
        onNext={handleNextStep}
      >
        <FileUploadArea onDrop={handleFileUpload(setVerificationKeyFile)} />
      </StepCard>

      <StepCard
        title="Upload Proving Key"
        number={3}
        activeStep={activeStep}
        isNextButtonDisabled={provingKeyFile === null}
        onNext={handleNextStep}
      >
        <FileUploadArea onDrop={handleFileUpload(setProvingKeyFile)} />
      </StepCard>

      <StepCard
        title="Select MPC Participants"
        number={4}
        activeStep={activeStep}
        isNextButtonDisabled={
          mpcParticipants.length === 0 ||
          selectedMpcParticipantAddresses.length === 0
        }
        onNext={handleNextStep}
      >
        <Table isPaginated={false} tableProps={mpcParticipantsTableProps} />
      </StepCard>

      <StepCard
        title="Select Service Tier"
        number={5}
        activeStep={activeStep}
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
