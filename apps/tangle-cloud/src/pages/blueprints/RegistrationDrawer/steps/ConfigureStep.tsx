import FieldTypeInput from '@tangle-network/tangle-shared-ui/components/PrimitiveFieldTypeInput';
import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { Input } from '@tangle-network/ui-components';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@tangle-network/ui-components/components/form';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
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
        <Typography variant="h5" fw="bold" className="mb-2">
          Configure Settings
        </Typography>

        <Typography
          variant="body2"
          className="text-mono-120 dark:text-mono-100"
        >
          Configure your RPC URL and registration parameters for each blueprint.
        </Typography>
      </div>

      <FormField
        control={form.control}
        name="rpcUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>RPC URL</FormLabel>
            <FormControl>
              <Input
                id="rpc-url-input"
                placeholder="https://rpc.example.com"
                isControlled
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {typeof blueprintConfigError?.message === 'string' && (
        <Typography variant="body3" className="text-red-500">
          {blueprintConfigError.message}
        </Typography>
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
            className="p-4 border border-mono-80 dark:border-mono-160 rounded-lg space-y-4"
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
                <Typography variant="body2" fw="bold">
                  {blueprint.name}
                </Typography>
                <Typography
                  variant="body3"
                  className="text-mono-120 dark:text-mono-100"
                >
                  {blueprint.registrationParams.length} parameter
                  {blueprint.registrationParams.length > 1 ? 's' : ''} required
                </Typography>

                {missingParamIndices.length > 0 && (
                  <Typography variant="body3" className="text-red-500">
                    Missing required params:{' '}
                    {missingParamIndices
                      .map((index) => `#${index + 1}`)
                      .join(', ')}
                  </Typography>
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
        <Typography
          variant="body2"
          className="text-mono-120 dark:text-mono-100 p-4 bg-mono-40 dark:bg-mono-160 rounded-lg"
        >
          None of the selected blueprints require registration parameters.
        </Typography>
      )}
    </div>
  );
};

export default ConfigureStep;
