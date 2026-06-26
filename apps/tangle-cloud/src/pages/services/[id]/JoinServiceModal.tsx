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
  Button,
  Skeleton,
  Text,
} from '../../../components/sandbox/SandboxUi';
import { useForm, Controller } from 'react-hook-form';
import { useJoinServiceWithCommitmentsTx } from '../../../data/services/useJoinServiceWithCommitmentsTx';
import { useServiceSecurityRequirements } from '../../../data/services/useServiceSecurityRequirements';
import { useOperatorStakeByAsset } from '@tangle-network/tangle-shared-ui/data/staking';
import useEvmOperatorInfo from '../../../hooks/useEvmOperatorInfo';
import { ExposureCommitmentInput } from '../../instances/Instances/UpdateBlueprintModel/ExposureCommitmentInput';
import ErrorMessage from '@tangle-network/tangle-shared-ui/components/ErrorMessage';
import type { Address } from 'viem';
import { parseAddressLowercase } from '@tangle-network/tangle-shared-ui/utils/safeParseAddress';

interface Props {
  serviceId: bigint;
  onClose: () => void;
}

type FormValues = {
  commitments: Record<string, number>;
};

const toAssetMapKey = (tokenAddress: string): string => {
  return parseAddressLowercase(tokenAddress) ?? tokenAddress.toLowerCase();
};

const JoinServiceModal: FC<Props> = ({ serviceId, onClose }) => {
  const { operatorAddress } = useEvmOperatorInfo();

  const {
    data: requirements,
    isLoading: isLoadingRequirements,
    error: requirementsError,
  } = useServiceSecurityRequirements(serviceId);

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
      const key = toAssetMapKey(req.asset.token);
      commitments[key] = req.minExposureBps;
    }
    return commitments;
  }, [requirements]);

  const getStakeForAsset = useCallback(
    (tokenAddress: Address): bigint | null => {
      if (!stakeByAsset) {
        return null;
      }
      const normalizedAddress = toAssetMapKey(tokenAddress) as Address;
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
        const key = toAssetMapKey(req.asset.token);
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
    <Modal open onOpenChange={(open: boolean) => !open && onClose()}>
      <ModalContent size="md">
        <ModalHeader>Join Service #{serviceId.toString()}</ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            <Text variant="body2" className="text-mono-120 dark:text-mono-100">
              Configure your security commitment for this service. This
              determines how much of your staked assets are at risk for slashing
              if you fail to perform your duties.
            </Text>

            {isLoading && (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            )}

            {!isLoading && hasRequirements && (
              <div className="space-y-4">
                {requirements.map((req) => {
                  const key = toAssetMapKey(req.asset.token);

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

            {!isLoading && requirementsError && (
              <ErrorMessage>
                Unable to load security requirements from the contract. Verify
                network selection and deployment addresses, then retry.
              </ErrorMessage>
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
            isDisabled={
              !isValid ||
              isJoining ||
              isLoading ||
              requirementsError !== null ||
              !hasRequirements
            }
          >
            {isJoining ? 'Joining...' : 'Join Service'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default JoinServiceModal;
