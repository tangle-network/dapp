import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { Text } from '../../../../components/sandbox/SandboxUi';
import { FC } from 'react';
import { UseFormReturn } from 'react-hook-form';
import type { RegistrationFormSchema } from '../types';

type ReviewStepProps = {
  blueprints: Blueprint[];
  form: UseFormReturn<RegistrationFormSchema>;
  isSubmitting: boolean;
};

const ReviewStep: FC<ReviewStepProps> = ({
  blueprints,
  form,
  isSubmitting,
}) => {
  const rpcUrl = form.watch('rpcUrl');
  const blueprintConfigs = form.watch('blueprintConfigs');

  return (
    <div className="space-y-6">
      <div>
        <Text variant="h5" fw="bold" className="mb-2">
          Review Registration
        </Text>

        <Text variant="body2" className="text-muted-foreground">
          Review your registration details before submitting.
        </Text>
      </div>

      {rpcUrl && (
        <div className="p-4 bg-muted/40 rounded-lg">
          <Text variant="body3" className="text-muted-foreground mb-1">
            RPC URL
          </Text>
          <Text variant="body2" fw="bold" className="break-all">
            {rpcUrl}
          </Text>
        </div>
      )}

      <div className="space-y-3">
        <Text variant="body2" fw="bold">
          Blueprints ({blueprints.length})
        </Text>

        <div className="space-y-3 max-h-[250px] overflow-y-auto">
          {blueprints.map((blueprint) => {
            const blueprintId = blueprint.id.toString();
            const config = blueprintConfigs[blueprintId];
            const paramsCount = Object.keys(config?.params || {}).length;

            return (
              <div
                key={blueprintId}
                className="p-4 border border-border rounded-lg bg-card/70"
              >
                <div className="flex items-center gap-3">
                  {blueprint.imgUrl && (
                    <img
                      src={blueprint.imgUrl}
                      width={40}
                      height={40}
                      alt={blueprint.name}
                      className="flex-shrink-0 bg-center rounded-full"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <Text variant="body2" fw="bold" className="truncate">
                      {blueprint.name}
                    </Text>
                    <Text variant="body3" className="text-muted-foreground">
                      {blueprint.author}
                    </Text>
                  </div>

                  {paramsCount > 0 && (
                    <div className="text-right">
                      <Text variant="body3" className="text-muted-foreground">
                        {paramsCount} param{paramsCount > 1 ? 's' : ''}
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isSubmitting && (
        <Text variant="body2" className="text-muted-foreground text-center">
          Registering as operator for {blueprints.length} blueprint
          {blueprints.length > 1 ? 's' : ''}...
        </Text>
      )}
    </div>
  );
};

export default ReviewStep;
