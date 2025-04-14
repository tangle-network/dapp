import { MonitoringServiceRequest } from '@tangle-network/tangle-shared-ui/data/blueprints/utils/type';
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
import { Children, useMemo, useEffect } from 'react';
import { PrimitiveAssetMetadata } from '@tangle-network/tangle-shared-ui/types/restake';
import { AssetCommitmentFormItem } from './AssetCommitmentFormItem';
import { validateSecurityCommitments } from '../../../../utils/validations/validateSecurityCommitment';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';

type ApproveConfirmationModalProps = {
  onClose: () => void;
  onConfirm: (data: ApprovalConfirmationFormFields) => Promise<void>;
  selectedRequest: MonitoringServiceRequest | null;
  assetsMetadata?: Map<string, PrimitiveAssetMetadata | null>;
  status: TxStatus;
};

function ApproveConfirmationModal({
  onClose,
  onConfirm,
  selectedRequest,
  assetsMetadata,
  status,
}: ApproveConfirmationModalProps) {
  const isSubmitting = status === TxStatus.PROCESSING;

  const securityCommitmentDefaultFormValue = useMemo(() => {
    if (!selectedRequest?.securityRequirements?.length) return [];

    return Array.from(
      { length: selectedRequest.securityRequirements.length ?? 0 },
      (_, index) => ({
        assetId: selectedRequest.securityRequirements[index].asset,
        exposurePercent:
          selectedRequest.securityRequirements[
            index
          ].minExposurePercent.toString(),
      }),
    );
  }, [selectedRequest?.securityRequirements]);

  const {
    setValue,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    values: {
      requestId: selectedRequest?.requestId ?? 0,
      securityCommitment: securityCommitmentDefaultFormValue,
    },
    resolver: (values) => {
      const errors =
        validateSecurityCommitments<ApprovalConfirmationFormFields>(
          values.securityCommitment,
          selectedRequest?.securityRequirements ?? [],
        );

      return {
        values,
        errors: Object.keys(errors).length > 0 ? errors : {},
      };
    },
  });

  useEffect(() => {
    if (status === TxStatus.COMPLETE) {
      onClose();
    }
  }, [status, onClose]);

  return (
    <ModalContent
      size="lg"
      onInteractOutside={(event) => event.preventDefault()}
      title={`Service Request #${selectedRequest?.requestId}`}
      description="Are you sure you want to approve this blueprint?"
    >
      <ModalHeader onClose={onClose}>
        Service Request #{selectedRequest?.requestId}
      </ModalHeader>

      <ModalBody>
        <BlueprintItem
          imgUrl={selectedRequest?.blueprintData?.metadata.logo ?? ''}
          renderImage={(imageUrl) => {
            return (
              <img
                src={imageUrl}
                alt={selectedRequest?.blueprintData?.metadata.name ?? ''}
                className="flex-shrink-0 bg-center rounded-full"
              />
            );
          }}
          id={selectedRequest?.blueprintData?.metadata.name ?? ''}
          name={selectedRequest?.blueprintData?.metadata.name ?? ''}
          restakersCount={selectedRequest?.blueprintData?.restakersCount ?? 0}
          operatorsCount={selectedRequest?.blueprintData?.operatorsCount ?? 0}
          tvl={selectedRequest?.blueprintData?.tvl?.toString() ?? '0'}
          isBoosted={false}
          category={selectedRequest?.blueprintData?.metadata.category ?? ''}
          description={
            selectedRequest?.blueprintData?.metadata.description ?? ''
          }
          author={selectedRequest?.blueprintData?.metadata.author ?? ''}
        />

        <form onSubmit={handleSubmit(onConfirm)} className="mt-4 space-y-4">
          <Typography variant="h4" className="text-center mb-3">
            Security Commitments
          </Typography>
          {Children.toArray(
            securityCommitmentDefaultFormValue.map(({ assetId }, index) => {
              const assetMetadata = assetsMetadata?.get(assetId);
              const exposurePercentFormValue = watch(
                `securityCommitment.${index}.exposurePercent`,
              );

              return (
                <AssetCommitmentFormItem
                  index={index}
                  assetId={assetId}
                  assetMetadata={assetMetadata}
                  exposurePercent={exposurePercentFormValue}
                  onChangeExposurePercent={(value) => {
                    setValue(
                      `securityCommitment.${index}.exposurePercent`,
                      value,
                      {
                        shouldValidate: true,
                        shouldDirty: true,
                      },
                    );
                  }}
                  exposurePercentErrorMsg={
                    errors.securityCommitment?.[index]?.exposurePercent?.message
                  }
                  minExposurePercent={selectedRequest?.securityRequirements?.[
                    index
                  ]?.minExposurePercent.toString()}
                  maxExposurePercent={selectedRequest?.securityRequirements?.[
                    index
                  ]?.maxExposurePercent.toString()}
                />
              );
            }),
          )}
        </form>
      </ModalBody>
      <ModalFooterActions
        isConfirmDisabled={!isValid || isSubmitting}
        isProcessing={isSubmitting}
        confirmButtonText="Approve"
        onConfirm={handleSubmit(onConfirm)}
        hasCloseButton
      />
    </ModalContent>
  );
}

export default ApproveConfirmationModal;
