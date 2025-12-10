import {
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
  Typography,
} from '@tangle-network/ui-components';
import BlueprintItem from '@tangle-network/tangle-shared-ui/components/blueprints/BlueprintGallery/BlueprintItem';
import { ApprovalConfirmationFormFields } from '../../../../types';
import { useForm } from 'react-hook-form';
import { useEffect, FC } from 'react';
import {
  useAllBlueprints,
  type ServiceRequest,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import addCommasToNumber from '@tangle-network/ui-components/utils/addCommasToNumber';

// Service request with optional blueprint metadata
interface ServiceRequestWithBlueprint extends ServiceRequest {
  blueprintData?: Blueprint;
}

type Props = {
  onClose: () => void;
  onConfirm: (data: ApprovalConfirmationFormFields) => Promise<void>;
  selectedRequest: ServiceRequestWithBlueprint | null;
  assetsMetadata?: unknown; // For future use with asset metadata
  status: TxStatus;
};

// Form values type
type FormValues = {
  requestId: bigint;
  restakingPercent: number;
};

const ApproveConfirmationModal: FC<Props> = ({
  onClose,
  onConfirm,
  selectedRequest,
  status,
}: Props) => {
  const isSubmitting = status === TxStatus.PROCESSING;

  const { blueprints: allBlueprints } = useAllBlueprints();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      requestId: selectedRequest?.requestId ?? BigInt(0),
      restakingPercent: 0,
    },
  });

  // Close the modal when the transaction is complete.
  useEffect(() => {
    if (status === TxStatus.COMPLETE) {
      onClose();
    }
  }, [status, onClose]);

  // Handle form submission with type conversion.
  const handleFormSubmit = (data: FormValues) => {
    const formattedData: ApprovalConfirmationFormFields = {
      requestId: Number(data.requestId),
      restakingPercent: data.restakingPercent,
    };
    return onConfirm(formattedData);
  };

  // Don't load the modal until the request prop is given.
  if (selectedRequest === null) {
    return null;
  }

  const blueprintStats = allBlueprints?.get(
    selectedRequest.blueprintId.toString(),
  );

  const instancesCount = blueprintStats?.instancesCount ?? 0;
  const operatorsCount = blueprintStats?.operatorsCount ?? 0;
  const restakersCount = blueprintStats?.restakersCount ?? 0;

  return (
    <ModalContent
      size="lg"
      onInteractOutside={(event) => event.preventDefault()}
      title={`Service Request #${addCommasToNumber(Number(selectedRequest.requestId))}`}
      description="Are you sure you want to approve this request?"
    >
      <ModalHeader onClose={onClose}>
        Service Request #{addCommasToNumber(Number(selectedRequest.requestId))}
      </ModalHeader>

      <ModalBody>
        <BlueprintItem
          imgUrl={selectedRequest.blueprintData?.imgUrl ?? ''}
          name={selectedRequest.blueprintData?.name ?? ''}
          instancesCount={instancesCount}
          operatorsCount={operatorsCount}
          restakersCount={restakersCount}
          isBoosted={false}
          category={selectedRequest.blueprintData?.category ?? ''}
          author={selectedRequest.blueprintData?.author ?? ''}
          description={selectedRequest.blueprintData?.description ?? ''}
          renderImage={(imageUrl) => {
            return (
              <img
                src={imageUrl}
                alt={selectedRequest.blueprintData?.name ?? ''}
                className="flex-shrink-0 bg-center rounded-full"
              />
            );
          }}
        />

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="mt-4 space-y-4"
        >
          <Typography variant="h4" className="text-center mb-3">
            Restaking Commitment
          </Typography>

          <div className="space-y-2">
            <label className="text-sm text-mono-140 dark:text-mono-80">
              Restaking Percentage (0-100%)
            </label>
            <input
              id="restakingPercent"
              type="number"
              min={0}
              max={100}
              {...register('restakingPercent', {
                required: 'Restaking percentage is required',
                min: { value: 0, message: 'Must be at least 0%' },
                max: { value: 100, message: 'Cannot exceed 100%' },
              })}
              placeholder="Enter restaking percentage"
              className="w-full h-10 px-3 rounded-lg border border-mono-80 dark:border-mono-140 bg-mono-0 dark:bg-mono-180 text-mono-200 dark:text-mono-0 placeholder:text-mono-80 dark:placeholder:text-mono-120"
            />
            {errors.restakingPercent && (
              <p className="text-xs text-red-50">
                {errors.restakingPercent.message}
              </p>
            )}
          </div>
        </form>
      </ModalBody>

      <ModalFooterActions
        isConfirmDisabled={!isValid || isSubmitting}
        isProcessing={isSubmitting}
        confirmButtonText="Approve"
        onConfirm={handleSubmit(handleFormSubmit)}
        hasCloseButton
      />
    </ModalContent>
  );
};

export default ApproveConfirmationModal;
