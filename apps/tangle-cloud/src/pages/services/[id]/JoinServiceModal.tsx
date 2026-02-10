/**
 * Modal for joining a service as an operator.
 * Renders an ExposureCommitmentInput slider per security requirement asset,
 * then calls joinServiceWithCommitments with per-asset commitments.
 */

import { FC, useCallback, useMemo, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Typography,
  Button,
  SkeletonLoader,
} from '@tangle-network/ui-components';
import { useForm, Controller } from 'react-hook-form';
import { useJoinServiceWithCommitmentsTx } from '../../../data/services/useJoinServiceWithCommitmentsTx';
import { useServiceSecurityRequirements } from '../../../data/services/useServiceSecurityRequirements';
import { useOperatorStakeByAsset } from '@tangle-network/tangle-shared-ui/data/restake/useOperatorDelegationsByAsset';
import useEvmOperatorInfo from '../../../hooks/useEvmOperatorInfo';
import { ExposureCommitmentInput } from '../../instances/Instances/UpdateBlueprintModel/ExposureCommitmentInput';
import ErrorMessage from '../../../components/ErrorMessage';
import type { Address } from 'viem';

interface Props {
  serviceId: bigint;
  onClose: () => void;
}

type FormValues = {
  commitments: Record<string, number>;
};

const JoinServiceModal: FC<Props> = ({ serviceId, onClose }) => {
  const { operatorAddress } = useEvmOperatorInfo();

  const { data: requirements, isLoading: isLoadingRequirements } =
    useServiceSecurityRequirements(serviceId);

  const assetsToQuery = useMemo(() => {
    if (!requirements || requirements.length === 0) {
      return undefined;
    }
    return requirements.map((req) => ({
      kind: req.asset.kind,
      token: req.asset.token,
    }));
  }, [requirements]);

  const { data: stakeByAsset, isLoading: isLoadingStake } =
    useOperatorStakeByAsset(operatorAddress, assetsToQuery);

  const initialCommitments = useMemo(() => {
    if (!requirements || requirements.length === 0) {
      return {};
    }

    const commitments: Record<string, number> = {};
    for (const req of requirements) {
      const key = req.asset.token.toLowerCase();
      commitments[key] = req.minExposureBps;
    }
    return commitments;
  }, [requirements]);

  const getStakeForAsset = useCallback(
    (tokenAddress: Address): bigint | null => {
      if (!stakeByAsset) {
        return null;
      }
      const normalizedAddress = tokenAddress.toLowerCase() as Address;
      const stake = stakeByAsset.get(normalizedAddress);
      return stake?.totalStake ?? BigInt(0);
    },
    [stakeByAsset],
  );

  const {
    handleSubmit,
    control,
    setValue,
    formState: { isValid },
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      commitments: {},
    },
  });

  useEffect(() => {
    if (Object.keys(initialCommitments).length > 0) {
      setValue('commitments', initialCommitments);
    }
  }, [initialCommitments, setValue]);

  const {
    execute: executeJoinWithCommitments,
    isPending: isJoining,
    error: txError,
  } = useJoinServiceWithCommitmentsTx({
    onSuccess: () => {
      onClose();
    },
  });

  const handleFormSubmit = useCallback(
    (data: FormValues) => {
      if (!executeJoinWithCommitments || !requirements) {
        return;
      }

      const commitments = requirements.map((req) => {
        const key = req.asset.token.toLowerCase();
        const exposureBps = data.commitments[key] ?? req.minExposureBps;

        return {
          asset: {
            kind: req.asset.kind,
            token: req.asset.token,
          },
          exposureBps,
        };
      });

      // Use the maximum of all minExposureBps as the overall exposureBps
      const overallExposureBps = Math.max(
        ...requirements.map((req) => req.minExposureBps),
      );

      executeJoinWithCommitments({
        serviceId,
        exposureBps: overallExposureBps,
        commitments,
      });
    },
    [requirements, executeJoinWithCommitments, serviceId],
  );

  const isLoading = isLoadingRequirements || isLoadingStake;
  const hasRequirements = requirements && requirements.length > 0;

  return (
    <Modal open onOpenChange={(open) => !open && onClose()}>
      <ModalContent size="md">
        <ModalHeader>Join Service #{serviceId.toString()}</ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            <Typography variant="body2" className="text-mono-100">
              Configure your security commitment for this service. This
              determines how much of your staked assets are at risk for slashing
              if you fail to perform your duties.
            </Typography>

            {isLoading && (
              <div className="space-y-4">
                <SkeletonLoader className="h-24 w-full rounded-lg" />
                <SkeletonLoader className="h-24 w-full rounded-lg" />
              </div>
            )}

            {!isLoading && hasRequirements && (
              <div className="space-y-4">
                {requirements.map((req) => {
                  const key = req.asset.token.toLowerCase();

                  return (
                    <Controller
                      key={key}
                      name={`commitments.${key}`}
                      control={control}
                      defaultValue={req.minExposureBps}
                      rules={{
                        min: {
                          value: req.minExposureBps,
                          message: `Must be at least ${req.minExposureBps / 100}%`,
                        },
                        max: {
                          value: req.maxExposureBps,
                          message: `Cannot exceed ${req.maxExposureBps / 100}%`,
                        },
                      }}
                      render={({ field, fieldState }) => (
                        <ExposureCommitmentInput
                          tokenAddress={req.asset.token}
                          assetKind={req.asset.kind}
                          metadata={req.metadata}
                          minExposureBps={req.minExposureBps}
                          maxExposureBps={req.maxExposureBps}
                          value={field.value ?? req.minExposureBps}
                          onChange={field.onChange}
                          errorMessage={fieldState.error?.message}
                          delegatedAmount={getStakeForAsset(req.asset.token)}
                        />
                      )}
                    />
                  );
                })}
              </div>
            )}

            {txError && <ErrorMessage>{txError.message}</ErrorMessage>}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="secondary" onClick={onClose} isDisabled={isJoining}>
            Cancel
          </Button>

          <Button
            onClick={handleSubmit(handleFormSubmit)}
            isLoading={isJoining}
            isDisabled={!isValid || isJoining || isLoading || !hasRequirements}
          >
            {isJoining ? 'Joining...' : 'Join Service'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default JoinServiceModal;
