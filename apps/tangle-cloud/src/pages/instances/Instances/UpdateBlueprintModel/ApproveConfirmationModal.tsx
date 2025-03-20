import { MonitoringServiceRequest } from '@tangle-network/tangle-shared-ui/data/blueprints/utils/type';
import {
  Button,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@tangle-network/ui-components';
import BlueprintItem from '@tangle-network/tangle-shared-ui/components/blueprints/BlueprintGallery/BlueprintItem';
import { ApprovalConfirmationFormFields } from '../../../../types/approvalConfirmationForm';
import { useForm } from 'react-hook-form';
import { Children, useRef } from 'react';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import { AssetCommitmentFormItem } from './AssetCommitmentFormItem';
import { PalletAssetsAssetMetadata } from '@polkadot/types/lookup';

type ApproveConfirmationModelProps = {
  onClose: () => void;
  onConfirm: (data: ApprovalConfirmationFormFields) => Promise<boolean>;
  selectedRequest: MonitoringServiceRequest | null;
  assetsMetadata: Map<string, PalletAssetsAssetMetadata | null>;
};

function ApproveConfirmationModel({
  onClose,
  onConfirm,
  selectedRequest,
  assetsMetadata,
}: ApproveConfirmationModelProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const {
    setValue,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ApprovalConfirmationFormFields>({
    mode: 'onChange',
    defaultValues: {
      requestId: selectedRequest?.requestId,
      securityCommitment: [
        {
          assetId: '',
          exposurePercent: '',
        },
      ],
    },
    resolver: (values) => {
      const errors: any = {};

      // Validate each security commitment
      values.securityCommitment?.forEach((commitment, index) => {
        if (!commitment.assetId) {
          if (!errors.securityCommitment) errors.securityCommitment = [];
          if (!errors.securityCommitment[index])
            errors.securityCommitment[index] = {};
          errors.securityCommitment[index].assetId = {
            type: 'required',
            message: 'Asset is required',
          };
        }

        const selectedAsset = selectedRequest?.securityRequirements?.find(
          (requirement) => requirement.asset === commitment.assetId,
        );
        const minExposurePercent = selectedAsset?.minExposurePercent || 1;
        const maxExposurePercent = selectedAsset?.maxExposurePercent || 100;

        if (commitment.exposurePercent !== undefined) {
          const exposurePercent = Number(commitment.exposurePercent);

          if (!commitment.exposurePercent) {
            if (!errors.securityCommitment) errors.securityCommitment = [];
            if (!errors.securityCommitment[index])
              errors.securityCommitment[index] = {};
            errors.securityCommitment[index].exposurePercent = {
              type: 'required',
              message: 'Exposure percentage is required',
            };
          } else if (
            isNaN(exposurePercent) ||
            !Number.isInteger(exposurePercent)
          ) {
            if (!errors.securityCommitment) errors.securityCommitment = [];
            if (!errors.securityCommitment[index])
              errors.securityCommitment[index] = {};
            errors.securityCommitment[index].exposurePercent = {
              type: 'integer',
              message: 'Exposure percentage must be an integer',
            };
          } else if (exposurePercent < minExposurePercent) {
            if (!errors.securityCommitment) errors.securityCommitment = [];
            if (!errors.securityCommitment[index])
              errors.securityCommitment[index] = {};
            errors.securityCommitment[index].exposurePercent = {
              type: 'min',
              message: `Exposure percentage must be at least ${minExposurePercent}`,
            };
          } else if (exposurePercent > maxExposurePercent) {
            if (!errors.securityCommitment) errors.securityCommitment = [];
            if (!errors.securityCommitment[index])
              errors.securityCommitment[index] = {};
            errors.securityCommitment[index].exposurePercent = {
              type: 'max',
              message: `Exposure percentage must be less than or equal to ${maxExposurePercent}`,
            };
          }
        }
      });

      values.requestId = selectedRequest?.requestId as number;

      return {
        values,
        errors: Object.keys(errors).length > 0 ? errors : {},
      };
    },
  });

  const securityCommitment = watch('securityCommitment');

  const onCancel = () => {
    reset({
      requestId: selectedRequest?.requestId,
      securityCommitment: [
        {
          assetId: '',
          exposurePercent: '',
        },
      ],
    });
    onClose();
  };

  const onSubmit = async (data: ApprovalConfirmationFormFields) => {
    const isSuccess = await onConfirm(data);
    if (!isSuccess) return;

    reset({
      requestId: selectedRequest?.requestId,
      securityCommitment: [
        {
          assetId: '',
          exposurePercent: '',
        },
      ],
    });
    onClose();
  };

  return (
    <ModalContent
      size="lg"
      onInteractOutside={(event) => event.preventDefault()}
      title={`Service Request #${selectedRequest?.requestId}`}
      description="Are you sure you want to approve this blueprint?"
    >
      <ModalHeader>Service Request #{selectedRequest?.requestId}</ModalHeader>

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

        <form
          ref={formRef}
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 space-y-4"
        >
          {Children.toArray(
            securityCommitment.map((_, index) => (
              <AssetCommitmentFormItem
                index={index}
                assetId={watch(`securityCommitment.${index}.assetId`)}
                assetMetadata={assetsMetadata}
                assetOptions={selectedRequest?.securityRequirements}
                onChangeAssetId={(value) => {
                  setValue(
                    `securityCommitment.${index}.assetId`,
                    value as RestakeAssetId,
                    {
                      shouldValidate: true,
                      shouldDirty: true,
                    },
                  );
                }}
                assetErrorMsg={
                  errors.securityCommitment?.[index]?.assetId?.message
                }
                exposurePercent={watch(
                  `securityCommitment.${index}.exposurePercent`,
                )}
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
              />
            )),
          )}

          {selectedRequest?.securityRequirements?.length &&
            selectedRequest?.securityRequirements?.length > 1 && (
              <Button
                variant="secondary"
                onClick={() => {
                  const currentCommitments = watch('securityCommitment');
                  setValue('securityCommitment', [
                    ...currentCommitments,
                    { assetId: '' as RestakeAssetId, exposurePercent: '' },
                  ]);
                }}
              >
                Add Asset
              </Button>
            )}
        </form>
      </ModalBody>
      <ModalFooter className="flex justify-end">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit(onSubmit)}
          isDisabled={!isValid || isSubmitting}
        >
          Approve
        </Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default ApproveConfirmationModel;
