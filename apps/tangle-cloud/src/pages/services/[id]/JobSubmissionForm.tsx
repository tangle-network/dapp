/**
 * Form for submitting jobs to a service.
 */

import { FC, useState, useCallback } from 'react';
import { Button, Typography, Input } from '@tangle-network/ui-components';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tangle-network/ui-components/components/select';
import { useSubmitJobTx } from '@tangle-network/tangle-shared-ui/data/graphql';
import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { type Hex } from 'viem';
import ErrorMessage from '@tangle-network/tangle-shared-ui/components/ErrorMessage';

interface Props {
  serviceId: bigint;
  blueprint: Blueprint;
}

export const JobSubmissionForm: FC<Props> = ({ serviceId, blueprint }) => {
  const [selectedJobIndex, setSelectedJobIndex] = useState<number>(0);
  const [inputJson, setInputJson] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const { submitJob, status, error, reset } = useSubmitJobTx();

  // Get job definitions from blueprint
  // TODO: Parse from blueprint.requestParams when schema is available
  const jobs = blueprint.requestParams ?? [];

  const handleSubmit = useCallback(async () => {
    setValidationError(null);

    // Validate JSON input
    let parsedInputs: unknown;
    try {
      parsedInputs = inputJson.trim() ? JSON.parse(inputJson) : [];
    } catch {
      setValidationError('Invalid JSON format');
      return;
    }

    // Encode inputs as bytes
    // TODO: Use proper encoding based on job schema
    let encodedInputs: Hex;
    try {
      // For now, just encode as bytes
      const jsonString = JSON.stringify(parsedInputs);
      const encoder = new TextEncoder();
      const bytes = encoder.encode(jsonString);
      encodedInputs = `0x${Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')}` as Hex;
    } catch {
      setValidationError('Failed to encode inputs');
      return;
    }

    await submitJob({
      serviceId,
      jobIndex: selectedJobIndex,
      inputs: encodedInputs,
    });
  }, [serviceId, selectedJobIndex, inputJson, submitJob]);

  const isSubmitting = status === 'pending';
  const isSuccess = status === 'success';

  return (
    <div className="space-y-4">
      {/* Job Selection */}
      {jobs.length > 0 ? (
        <div>
          <Typography variant="body2" className="mb-2">
            Select Job
          </Typography>
          <Select
            value={selectedJobIndex.toString()}
            onValueChange={(v) => setSelectedJobIndex(Number(v))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a job" />
            </SelectTrigger>
            <SelectContent>
              {jobs.map((job, index) => (
                <SelectItem key={index} value={index.toString()}>
                  Job {index}:{' '}
                  {typeof job === 'object' ? JSON.stringify(job) : job}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div>
          <Typography variant="body2" className="mb-2">
            Job Index
          </Typography>
          <Input
            id="job-index"
            type="number"
            min={0}
            value={selectedJobIndex.toString()}
            onChange={(v) => setSelectedJobIndex(Number(v))}
            placeholder="Enter job index"
          />
        </div>
      )}

      {/* Job Inputs */}
      <div>
        <Typography variant="body2" className="mb-2">
          Job Inputs (JSON)
        </Typography>
        <textarea
          className="w-full h-32 p-3 rounded-lg border border-mono-60 dark:border-mono-140 bg-mono-0 dark:bg-mono-180 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder='Enter job inputs as JSON array, e.g., ["arg1", 123]'
          value={inputJson}
          onChange={(e) => {
            setInputJson(e.target.value);
            setValidationError(null);
          }}
        />
        <Typography variant="body3" className="text-mono-100 mt-1">
          Enter the arguments for this job as a JSON array
        </Typography>
      </div>

      {/* Errors */}
      {validationError && <ErrorMessage>{validationError}</ErrorMessage>}
      {error && <ErrorMessage>{error.message}</ErrorMessage>}

      {/* Success Message */}
      {isSuccess && (
        <div className="p-3 rounded-lg bg-green-500/20 text-green-400">
          <Typography variant="body2">
            Job submitted successfully! Results will appear in the history
            below.
          </Typography>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleSubmit}
          isLoading={isSubmitting}
          isDisabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Job'}
        </Button>
        {(isSuccess || error) && (
          <Button variant="secondary" onClick={reset}>
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};

export default JobSubmissionForm;
