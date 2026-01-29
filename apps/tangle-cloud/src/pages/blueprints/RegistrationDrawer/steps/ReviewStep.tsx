import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { FC } from 'react';
import { UseFormReturn } from 'react-hook-form';
import type { RegistrationFormSchema } from '../types';

type ReviewStepProps = {
  blueprints: Blueprint[];
  form: UseFormReturn<RegistrationFormSchema>;
  isSubmitting: boolean;
};

const ReviewStep: FC<ReviewStepProps> = ({ blueprints, form, isSubmitting }) => {
  const rpcUrl = form.watch('rpcUrl');
  const blueprintConfigs = form.watch('blueprintConfigs');

  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h5" fw="bold" className="mb-2">
          Review Registration
        </Typography>

        <Typography
          variant="body2"
          className="text-mono-120 dark:text-mono-100"
        >
          Review your registration details before submitting.
        </Typography>
      </div>

      {rpcUrl && (
        <div className="p-4 bg-mono-40 dark:bg-mono-160 rounded-lg">
          <Typography
            variant="body3"
            className="text-mono-120 dark:text-mono-100 mb-1"
          >
            RPC URL
          </Typography>
          <Typography variant="body2" fw="bold" className="break-all">
            {rpcUrl}
          </Typography>
        </div>
      )}

      <div className="space-y-3">
        <Typography variant="body2" fw="bold">
          Blueprints ({blueprints.length})
        </Typography>

        <div className="space-y-3 max-h-[250px] overflow-y-auto">
          {blueprints.map((blueprint) => {
            const blueprintId = blueprint.id.toString();
            const config = blueprintConfigs[blueprintId];
            const paramsCount = Object.keys(config?.params || {}).length;

            return (
              <div
                key={blueprintId}
                className="p-4 border border-mono-80 dark:border-mono-160 rounded-lg"
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
                    <Typography variant="body2" fw="bold" className="truncate">
                      {blueprint.name}
                    </Typography>
                    <Typography
                      variant="body3"
                      className="text-mono-120 dark:text-mono-100"
                    >
                      {blueprint.author}
                    </Typography>
                  </div>

                  {paramsCount > 0 && (
                    <div className="text-right">
                      <Typography
                        variant="body3"
                        className="text-mono-120 dark:text-mono-100"
                      >
                        {paramsCount} param{paramsCount > 1 ? 's' : ''}
                      </Typography>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isSubmitting && (
        <Typography
          variant="body2"
          className="text-mono-120 dark:text-mono-100 text-center"
        >
          Registering as operator for {blueprints.length} blueprint
          {blueprints.length > 1 ? 's' : ''}...
        </Typography>
      )}
    </div>
  );
};

export default ReviewStep;
