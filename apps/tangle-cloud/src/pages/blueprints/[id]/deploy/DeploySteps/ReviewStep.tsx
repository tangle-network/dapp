import {
  Avatar,
  Card,
  ExternalLinkIcon,
  Input,
  isEvmAddress,
  KeyValueWithButton,
  Label,
  toSubstrateAddress,
  Typography,
} from '@tangle-network/ui-components';
import { Children, FC, useCallback, useMemo } from 'react';
import { ApprovalModelLabel, SelectOperatorsStepProps } from './type';
import { InstructionSideCard } from './InstructionSideCard';
import InstanceHeader from '../../../../../components/InstanceHeader';
import assertRestakeAssetId from '@tangle-network/tangle-shared-ui/utils/assertRestakeAssetId';
import useAssetsMetadata from '@tangle-network/tangle-shared-ui/hooks/useAssetsMetadata';
import { AssetRequirementFormItem } from './components/AssetRequirementFormItem';
import { OperatorTable } from './components/OperatorTable';
import { BLUEPRINT_DEPLOY_STEPS } from '../../../../../utils/validations/deployBlueprint';
import useIdentities from '@tangle-network/tangle-shared-ui/hooks/useIdentities';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tangle-network/ui-components/components/select';
import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import ErrorMessage from '../../../../../components/ErrorMessage';

const stepKey = BLUEPRINT_DEPLOY_STEPS[4];

export const ReviewStep: FC<SelectOperatorsStepProps> = ({
  errors: globalErrors,
  setValue,
  watch,
  blueprint,
}) => {
  const labelClassName = 'text-mono-200 dark:text-mono-0 font-medium';
  const valueClassName = 'text-mono-200 dark:text-mono-0';

  const basicInformationStep = watch(BLUEPRINT_DEPLOY_STEPS[0]);
  const operatorSelectionStep = watch(BLUEPRINT_DEPLOY_STEPS[1]);
  const assetConfigurationStep = watch(BLUEPRINT_DEPLOY_STEPS[2]);
  const reviewStep = watch(stepKey);

  const selectedAssets = useMemo(
    () =>
      (operatorSelectionStep?.assets ?? []).map((asset) => ({
        ...asset,
        id: assertRestakeAssetId(asset.id),
      })),
    [operatorSelectionStep?.assets],
  );

  const assetIds = useMemo(
    () => selectedAssets.map(({ id }) => id),
    [selectedAssets],
  );
  const { result: assetsMetadata } = useAssetsMetadata(assetIds);

  const activeNetwork = useNetworkStore().network;

  const { result: callerIdentities } = useIdentities(
    useMemo(
      () =>
        basicInformationStep?.permittedCallers.map((caller) =>
          toSubstrateAddress(caller, activeNetwork.ss58Prefix),
        ),
      [basicInformationStep?.permittedCallers, activeNetwork.ss58Prefix],
    ),
  );

  const approvalModelLabel = useMemo(() => {
    const model = assetConfigurationStep?.approvalModel;
    return model
      ? ApprovalModelLabel[model as keyof typeof ApprovalModelLabel]
      : '';
  }, [assetConfigurationStep?.approvalModel]);

  const onChangePaymentAsset = useCallback(
    (nextValue: string) => {
      setValue(stepKey, {
        ...reviewStep,
        paymentAsset: nextValue,
      });
    },
    [reviewStep, setValue, stepKey],
  );

  const onChangePaymentAmount = useCallback(
    (nextValue: string) => {
      setValue(stepKey, {
        ...reviewStep,
        paymentAmount: Number(nextValue),
      });
    },
    [reviewStep, setValue, stepKey],
  );

  return (
    <div className="flex gap-8">
      <div className="w-1/4">
        <InstructionSideCard
          title="Review your deployment"
          description="After submitting request, operators will need to approve it before the instance deployment begins."
        />
      </div>

      <div className="w-3/4 space-y-6">
        <InstanceHeader
          title={blueprint?.name || ''}
          creator={blueprint?.author || ''}
          githubPath={blueprint?.githubUrl || ''}
        />

        <Card className="p-6">
          <Typography
            variant="h5"
            className="text-mono-200 dark:text-mono-0 mb-4"
          >
            Basic Information
          </Typography>
          <hr className="border-mono-80 dark:border-mono-160 mb-6" />

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className={labelClassName}>Instance Name</Label>
              <Typography variant="body1" className={valueClassName}>
                {basicInformationStep?.instanceName || '-'}
              </Typography>
            </div>

            <div className="space-y-2">
              <Label className={labelClassName}>Instance Duration</Label>
              <Typography variant="body1" className={valueClassName}>
                {basicInformationStep?.instanceDuration || '0'} Block(s)
              </Typography>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <Label className={labelClassName}>Permitted Callers</Label>
            <div className="space-y-3">
              {Children.toArray(
                basicInformationStep?.permittedCallers.map((caller, index) => {
                  const identity = callerIdentities?.get(
                    toSubstrateAddress(caller, activeNetwork.ss58Prefix),
                  );
                  const accountUrl = activeNetwork.createExplorerAccountUrl(
                    isEvmAddress(caller)
                      ? caller
                      : toSubstrateAddress(caller, activeNetwork.ss58Prefix),
                  );
                  return (
                    <div className="flex items-center gap-2">
                      <Avatar
                        sourceVariant="address"
                        value={caller}
                        theme="substrate"
                        size="md"
                      />

                      <div className="flex items-center">
                        <KeyValueWithButton
                          keyValue={identity?.name ? identity.name : caller}
                          size="sm"
                        />
                        {accountUrl && (
                          <ExternalLinkIcon
                            className="ml-1"
                            href={accountUrl}
                            target="_blank"
                          />
                        )}
                      </div>
                    </div>
                  );
                }),
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography
            variant="h5"
            className="text-mono-200 dark:text-mono-0 mb-4"
          >
            Asset Requirements
          </Typography>
          <hr className="border-mono-80 dark:border-mono-160 mb-6" />

          <div className="space-y-4">
            {Children.toArray(
              selectedAssets.map(({ id }, index) => {
                const assetMetadata = assetsMetadata?.get(id);
                const minExposurePercentFormValue =
                  assetConfigurationStep?.securityCommitments
                    ?.at(index)
                    ?.minExposurePercent.toString();
                const maxExposurePercentFormValue =
                  assetConfigurationStep?.securityCommitments
                    ?.at(index)
                    ?.maxExposurePercent?.toString();

                return (
                  <AssetRequirementFormItem
                    index={index}
                    assetId={id}
                    assetMetadata={assetMetadata}
                    minExposurePercent={minExposurePercentFormValue}
                    maxExposurePercent={maxExposurePercentFormValue}
                  />
                );
              }),
            )}
          </div>
        </Card>

        <Card className="p-6">
          <Typography
            variant="h5"
            className="text-mono-200 dark:text-mono-0 mb-4"
          >
            Approval Settings
          </Typography>
          <hr className="border-mono-80 dark:border-mono-160 mb-6" />

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className={labelClassName}>Approval Model</Label>
              <Typography variant="body1" className={valueClassName}>
                {approvalModelLabel}
              </Typography>
            </div>

            {assetConfigurationStep?.approvalModel === 'Dynamic' && (
              <div className="space-y-2">
                <Label className={labelClassName}>Approval Threshold</Label>
                <Typography variant="body1" className={valueClassName}>
                  {assetConfigurationStep?.minApproval || '0'}
                </Typography>
              </div>
            )}
          </div>

          <div className="mt-8 space-y-4">
            <Label className={labelClassName}>Selected Operators</Label>
            <OperatorTable
              advanceFilter={(row) => {
                return operatorSelectionStep?.operators?.includes(row.address);
              }}
            />
          </div>
        </Card>

        <Card className="p-6">
          <Typography
            variant="h5"
            className="text-mono-200 dark:text-mono-0 mb-4"
          >
            Payment:
          </Typography>
          <hr className="border-mono-80 dark:border-mono-160 mb-6" />

          <div className="flex gap-8">
            <div className="w-1/2">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Payment Asset" />
                </SelectTrigger>
                <SelectContent>
                  {/* TODO: Question: How to get payment assets?
                  {
                    Children.toArray(
                      restakeAssetIds?.map((id) => {
                        const metadata = restakeAssetsMetadata?.get(id);
                        return (
                          <SelectItem value={id}>
                            <LsTokenIcon 
                              name={metadata?.symbol ?? "TNT"}
                              size="md"
                            />
                            <Typography variant="body1" className={valueClassName}>
                              {metadata?.symbol ?? "TNT"}
                            </Typography>
                          </SelectItem>
                        )
                      })
                    )
                  } */}
                  <SelectItem value="TNT">
                    <div className="flex gap-2 items-center">
                      <LsTokenIcon name={'TNT'} size="md" />
                      <Typography variant="body1" className={valueClassName}>
                        TNT
                      </Typography>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <ErrorMessage>
                {globalErrors?.[stepKey]?.paymentAsset?.message}
              </ErrorMessage>
            </div>

            <div className="w-1/2">
              <Input
                value={reviewStep?.paymentAmount?.toString()}
                onChange={(nextValue) => onChangePaymentAmount(nextValue)}
                isControlled
                type="number"
                id="payment-amount"
              />
              <ErrorMessage>
                {globalErrors?.[stepKey]?.paymentAmount?.message}
              </ErrorMessage>
            </div>
          </div>
          <ErrorMessage>{globalErrors?.[stepKey]?.message}</ErrorMessage>
        </Card>
      </div>
    </div>
  );
};
