/**
 * Advanced deployment options - collapsible section for power users.
 */

import { FC, useState } from 'react';
import {
  Card,
  Typography,
  Input,
} from '@tangle-network/ui-components';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tangle-network/ui-components/components/select';
import { ChevronDown, ChevronUp } from '@tangle-network/icons';
import { BaseDeployStepProps } from './type';

interface AdvancedOptionsStepProps extends BaseDeployStepProps {
  minimumNativeSecurityRequirement: number;
}

export const AdvancedOptionsStep: FC<AdvancedOptionsStepProps> = ({
  errors,
  setValue,
  watch,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const approvalModel = watch('approvalModel');
  const minApproval = watch('minApproval');
  const maxApproval = watch('maxApproval');
  const operators = watch('operators') ?? [];

  return (
    <Card className="p-6">
      <button
        type="button"
        className="w-full flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Typography variant="h5" className="text-mono-200 dark:text-mono-0">
          Advanced Options
        </Typography>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-mono-100" />
        ) : (
          <ChevronDown className="w-5 h-5 text-mono-100" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-6 space-y-6">
          {/* Approval Model */}
          <div>
            <Typography variant="body1" fw="semibold" className="mb-2">
              Approval Model
            </Typography>
            <Typography variant="body2" className="text-mono-100 mb-3">
              Configure how job results are approved and aggregated.
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Typography variant="body3" className="mb-1">
                  Model Type
                </Typography>
                <Select
                  value={approvalModel ?? 'Fixed'}
                  onValueChange={(v) =>
                    setValue('approvalModel', v as 'Dynamic' | 'Fixed')
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fixed">
                      Fixed (exact operator count)
                    </SelectItem>
                    <SelectItem value="Dynamic">
                      Dynamic (min-max range)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Typography variant="body3" className="mb-1">
                  Min Approvals Required
                </Typography>
                <Input
                  id="minApproval"
                  type="number"
                  min={1}
                  max={operators.length || 1}
                  value={minApproval?.toString() ?? '1'}
                  onChange={(v) => setValue('minApproval', Number(v))}
                />
                {errors?.minApproval?.message && (
                  <Typography variant="body3" className="text-red-500 mt-1">
                    {errors.minApproval.message}
                  </Typography>
                )}
              </div>

              {approvalModel === 'Dynamic' && (
                <div>
                  <Typography variant="body3" className="mb-1">
                    Max Approvals
                  </Typography>
                  <Input
                    id="maxApproval"
                    type="number"
                    min={minApproval ?? 1}
                    max={operators.length || 10}
                    value={maxApproval?.toString() ?? ''}
                    onChange={(v) => setValue('maxApproval', Number(v))}
                  />
                  {errors?.maxApproval?.message && (
                    <Typography variant="body3" className="text-red-500 mt-1">
                      {errors.maxApproval.message}
                    </Typography>
                  )}
                </div>
              )}
            </div>

            <Typography variant="body3" className="text-mono-100 mt-2">
              {approvalModel === 'Fixed'
                ? 'Fixed model requires exactly the minimum number of operator approvals.'
                : 'Dynamic model allows between min and max operator approvals.'}
            </Typography>
          </div>

          {/* Security Deposit Info */}
          <div>
            <Typography variant="body1" fw="semibold" className="mb-2">
              Security Information
            </Typography>
            <div className="p-4 bg-mono-20 dark:bg-mono-170 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography variant="body3" className="text-mono-100">
                    Selected Operators
                  </Typography>
                  <Typography variant="body1" fw="semibold">
                    {operators.length}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body3" className="text-mono-100">
                    Approval Threshold
                  </Typography>
                  <Typography variant="body1" fw="semibold">
                    {minApproval ?? 1} / {operators.length || '-'}
                  </Typography>
                </div>
              </div>
              <Typography variant="body3" className="text-mono-100 mt-3">
                Operators commit security deposits when joining the service.
                These deposits can be slashed for misbehavior.
              </Typography>
            </div>
          </div>

          {/* Service Lifecycle */}
          <div>
            <Typography variant="body1" fw="semibold" className="mb-2">
              Service Lifecycle
            </Typography>
            <Typography variant="body2" className="text-mono-100 mb-3">
              The service will remain active until the TTL expires or you
              terminate it. Operators can leave with proper notice.
            </Typography>
            <ul className="list-disc list-inside text-mono-100 space-y-1">
              <li>
                <Typography variant="body3" component="span">
                  Service can be terminated early by the owner
                </Typography>
              </li>
              <li>
                <Typography variant="body3" component="span">
                  Unused payments are refunded on termination
                </Typography>
              </li>
              <li>
                <Typography variant="body3" component="span">
                  Operator rewards are distributed on job completion
                </Typography>
              </li>
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AdvancedOptionsStep;
