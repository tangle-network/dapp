import FieldTypeInput from '@tangle-network/tangle-shared-ui/components/PrimitiveFieldTypeInput';
import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { Input, Text } from '../../../../components/sandbox/SandboxUi';
import { FC, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  getMissingRegistrationParamIndices,
  upsertRegistrationParamValue,
} from '../registrationInputs';
import type { RegistrationFormSchema } from '../types';

type ConfigureStepProps = {
  blueprints: Blueprint[];
  form: UseFormReturn<RegistrationFormSchema>;
};

const ConfigureStep: FC<ConfigureStepProps> = ({ blueprints, form }) => {
  const handleParamChange = useCallback(
    (blueprintId: string, paramId: string, value: unknown) => {
      const currentConfig = form.getValues(`blueprintConfigs.${blueprintId}`);
      const currentParams = currentConfig?.params ?? {};
      const nextParams = upsertRegistrationParamValue(
        currentParams,
        paramId,
        value,
      );

      form.setValue(`blueprintConfigs.${blueprintId}`, {
        ...currentConfig,
        params: nextParams,
      });
    },
    [form],
  );

  const blueprintConfigError = form.formState.errors.blueprintConfigs;

  return (
    <div className="space-y-6">
      <div>
        <Text variant="h5" fw="bold" className="mb-2">
          Configure Settings
        </Text>

        <Text variant="body2" className="text-mono-120 dark:text-mono-100">
          Configure your RPC URL and registration parameters for each blueprint.
        </Text>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-mono-200 dark:text-mono-0">
          RPC URL
        </label>
        <Input
          id="rpc-url-input"
          placeholder="https://rpc.example.com"
          isControlled
          value={form.watch('rpcUrl') ?? ''}
          onChange={(value) =>
            form.setValue('rpcUrl', value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
        {form.formState.errors.rpcUrl?.message && (
          <Text variant="body3" className="text-red-500 dark:text-red-400">
            {form.formState.errors.rpcUrl.message}
          </Text>
        )}
      </div>

      {typeof blueprintConfigError?.message === 'string' && (
        <Text variant="body3" className="text-red-500 dark:text-red-400">
          {blueprintConfigError.message}
        </Text>
      )}

      {blueprints.map((blueprint) => {
        const blueprintId = blueprint.id.toString();
        const hasParams = blueprint.registrationParams.length > 0;
        const currentConfig = form.watch(`blueprintConfigs.${blueprintId}`);
        const missingParamIndices = getMissingRegistrationParamIndices(
          blueprint.registrationParams,
          currentConfig?.params ?? {},
        );

        if (!hasParams) {
          return null;
        }

        return (
          <div
            key={blueprintId}
            className="p-4 border border-mono-60 dark:border-mono-170 rounded-lg space-y-4 bg-mono-0 dark:bg-mono-180/70"
          >
            <div className="flex items-center gap-3">
              {blueprint.imgUrl && (
                <img
                  src={blueprint.imgUrl}
                  width={32}
                  height={32}
                  alt={blueprint.name}
                  className="flex-shrink-0 bg-center rounded-full"
                />
              )}

              <div>
                <Text variant="body2" fw="bold">
                  {blueprint.name}
                </Text>
                <Text
                  variant="body3"
                  className="text-mono-120 dark:text-mono-100"
                >
                  {blueprint.registrationParams.length} parameter
                  {blueprint.registrationParams.length > 1 ? 's' : ''} required
                </Text>

                {missingParamIndices.length > 0 && (
                  <Text
                    variant="body3"
                    className="text-red-500 dark:text-red-400"
                  >
                    Missing required params:{' '}
                    {missingParamIndices
                      .map((index) => `#${index + 1}`)
                      .join(', ')}
                  </Text>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {blueprint.registrationParams.map((param, idx) => {
                const paramId = idx.toString();
                const value = currentConfig?.params?.[paramId];

                return (
                  <FieldTypeInput
                    key={paramId}
                    label={`Param ${idx + 1}`}
                    fieldType={param}
                    id={paramId}
                    value={value}
                    onValueChange={(id, newValue) =>
                      handleParamChange(blueprintId, id, newValue)
                    }
                    tabIndex={idx + 1}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {blueprints.every((bp) => bp.registrationParams.length === 0) && (
        <Text
          variant="body2"
          className="text-mono-120 dark:text-mono-100 p-4 bg-mono-20/50 dark:bg-mono-190/50 rounded-lg"
        >
          None of the selected blueprints require registration parameters.
        </Text>
      )}
    </div>
  );
};

export default ConfigureStep;
