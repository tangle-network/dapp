'use client';

import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  CheckBox,
  Progress,
  Table,
  fuzzyFilter,
} from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { FC, useCallback, useMemo, useState } from 'react';
import { CONTACT_URL } from '../../constants';
import { MOCK_MPC_PARTICIPANTS } from '../../constants/mock';
import { requestProofGeneration } from '../../server/services';
import { RelativePageUrl } from '../../utils';
import FileUploadAreaWithList from '../FileUploadAreaWithList';
import IdentityItem from './IdentityItem';
import ServiceTierCard from './ServiceTierCard';
import StepCard from './StepCard';
import { ColumnKey, Location, MpcParticipant, Plan } from './types';

export type ProofGenerationStepCardsProps = {
  circuitFilename: string;
  activeStep: number;
  nextStep: () => void;
};

type RowData = {
  [ColumnKey.IsChecked]: boolean;
  [ColumnKey.Identity]: string;
  [ColumnKey.Location]: Location;
  [ColumnKey.SlashingIncidents]: number;
  [ColumnKey.Uptime]: number;
};

const ProofGenerationStepCards: FC<ProofGenerationStepCardsProps> = ({
  circuitFilename,
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
        mpcParticipantAddresses: selectedMpcParticipantAddresses,
        provingKey: provingKeyFile,
        r1cs: r1csFile,
        verificationKey: verificationKeyFile,
      });

      // TODO: This is temporary. Consider showing a toast, modal, or redirecting to a new page after a response is received from the backend.
      if (response.isSuccess) {
        alert('Proof generation has been initialized successfully!');
        window.open(RelativePageUrl.Dashboard, '_self');
      }
    },
    [
      mpcParticipants.length,
      nextStep,
      provingKeyFile,
      r1csFile,
      selectedMpcParticipantAddresses,
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
      fuzzy: fuzzyFilter,
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

  return (
    <div className="flex flex-col gap-6 flex-grow">
      <StepCard
        title="Process R1SC File"
        number={1}
        activeStep={activeStep}
        isNextButtonDisabled={r1csFile === null}
        onNext={handleNextStep}
      >
        <FileUploadAreaWithList
          title="R1CS"
          filename={circuitFilename}
          file={r1csFile}
          setFile={setR1csFile}
        />
      </StepCard>

      <StepCard
        title="Upload Verification Key"
        number={2}
        activeStep={activeStep}
        isNextButtonDisabled={verificationKeyFile === null}
        onNext={handleNextStep}
      >
        <FileUploadAreaWithList
          title="Verification Key"
          filename={circuitFilename}
          file={verificationKeyFile}
          setFile={setVerificationKeyFile}
        />
      </StepCard>

      <StepCard
        title="Upload Proving Key"
        number={3}
        activeStep={activeStep}
        isNextButtonDisabled={provingKeyFile === null}
        onNext={handleNextStep}
      >
        <FileUploadAreaWithList
          title="Proving Key"
          filename={circuitFilename}
          file={provingKeyFile}
          setFile={setProvingKeyFile}
        />
      </StepCard>

      <StepCard
        title="Select MPC Participants"
        number={4}
        activeStep={activeStep}
        onNext={handleNextStep}
        isNextButtonDisabled={
          mpcParticipants.length === 0 ||
          selectedMpcParticipantAddresses.length === 0
        }
      >
        <div className="overflow-x-auto">
          <Table isPaginated={false} tableProps={mpcParticipantsTableProps} />
        </div>
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

export default ProofGenerationStepCards;
