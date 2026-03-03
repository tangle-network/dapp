import React, { FC, useCallback, useState } from 'react';
import { RequestArgsConfigurationStepProps } from './type';
import { Card, Typography } from '@tangle-network/ui-components';
import ErrorMessage from '@tangle-network/tangle-shared-ui/components/ErrorMessage';

export const RequestArgsConfigurationStep: FC<
  RequestArgsConfigurationStepProps
> = ({
  errors,
  setValue,
  watch: _watch,
  blueprint,
  requestSchemaFieldCount,
  hasRequestSchema,
  requestSchemaParseError,
  setError,
  clearErrors,
}) => {
  const [jsonText, setJsonText] = useState<string>('');
  const expectedArgsCount =
    requestSchemaFieldCount ?? blueprint?.requestParams?.length ?? 0;

  const handleJsonChange = useCallback(
    (text: string) => {
      setJsonText(text);

      if (text.trim() === '') {
        setValue('requestArgs', []);
        clearErrors('requestArgs');
        return;
      }

      try {
        const parsed = JSON.parse(text);

        if (Array.isArray(parsed)) {
          setValue('requestArgs', parsed as unknown[]);
          if (parsed.length !== expectedArgsCount) {
            setError('requestArgs', {
              type: 'manual',
              message: `Request arguments length mismatch: expected ${expectedArgsCount}, got ${parsed.length}`,
            });
          } else {
            clearErrors('requestArgs');
          }
          return;
        }

        setValue('requestArgs', []);
        setError('requestArgs', {
          type: 'manual',
          message: 'Request arguments must be provided as a JSON array.',
        });
      } catch {
        setValue('requestArgs', []);
        setError('requestArgs', {
          type: 'manual',
          message:
            'Invalid JSON. Request arguments must be a valid JSON array.',
        });
      }
    },
    [clearErrors, expectedArgsCount, setError, setValue],
  );

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        handleJsonChange(text);
      };
      reader.readAsText(file);
    },
    [handleJsonChange],
  );

  return (
    <Card className="p-6">
      <Typography variant="h5" className="text-mono-200 dark:text-mono-0 mb-4">
        Request Arguments
      </Typography>

      {requestSchemaParseError && (
        <ErrorMessage className="mb-4">
          Failed to parse on-chain request schema: {requestSchemaParseError}
        </ErrorMessage>
      )}

      {expectedArgsCount === 0 ? (
        <Typography variant="body1">No request arguments required.</Typography>
      ) : (
        <>
          <Typography variant="body2" className="mb-4">
            Paste or upload a JSON array representing the request arguments.
            This blueprint expects exactly {expectedArgsCount} root argument(s).
          </Typography>

          {hasRequestSchema === false && (
            <ErrorMessage className="mb-4">
              On-chain request schema is unavailable. Non-empty request
              arguments cannot be encoded for this blueprint.
            </ErrorMessage>
          )}

          <textarea
            className="w-full min-h-[180px] bg-mono-0 dark:bg-mono-180 border border-mono-60 dark:border-mono-120 rounded-lg p-4 text-sm font-mono mb-4 resize-vertical text-mono-160 dark:text-mono-40 placeholder:text-mono-100 dark:placeholder:text-mono-100 focus:border-blue-50 dark:focus:border-blue-50 focus:ring-1 focus:ring-blue-50 dark:focus:ring-blue-50 transition-colors"
            value={jsonText}
            onChange={(e) => handleJsonChange(e.target.value)}
            placeholder={`Paste JSON array with ${expectedArgsCount} item(s)`}
          />

          <div className="mb-4">
            <input
              type="file"
              accept="application/json"
              onChange={handleFileUpload}
              className="block w-full text-sm text-mono-140 dark:text-mono-60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-mono-40 dark:file:bg-mono-140 file:text-mono-160 dark:file:text-mono-40 hover:file:bg-mono-60 dark:hover:file:bg-mono-120 file:cursor-pointer cursor-pointer transition-colors"
            />
          </div>
        </>
      )}

      {errors?.requestArgs && (
        <ErrorMessage>{errors.requestArgs.message}</ErrorMessage>
      )}
    </Card>
  );
};
