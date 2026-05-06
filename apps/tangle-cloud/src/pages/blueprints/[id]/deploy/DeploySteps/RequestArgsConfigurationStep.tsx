import React, { FC, useCallback, useState } from 'react';
import { RequestArgsConfigurationStepProps } from './type';
import {
  Card,
  Text,
  Textarea,
} from '../../../../../components/sandbox/SandboxUi';
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
      <Text variant="h5" className="mb-4">
        Request Arguments
      </Text>

      {requestSchemaParseError && (
        <ErrorMessage className="mb-4">
          Failed to parse on-chain request schema: {requestSchemaParseError}
        </ErrorMessage>
      )}

      {expectedArgsCount === 0 ? (
        <Text variant="body1">No request arguments required.</Text>
      ) : (
        <>
          <Text variant="body2" className="mb-4">
            Paste or upload a JSON array representing the request arguments.
            This blueprint expects exactly {expectedArgsCount} root argument(s).
          </Text>

          {hasRequestSchema === false && (
            <ErrorMessage className="mb-4">
              On-chain request schema is unavailable. Non-empty request
              arguments cannot be encoded for this blueprint.
            </ErrorMessage>
          )}

          <Textarea
            className="mb-4 min-h-[180px] w-full resize-y font-mono"
            value={jsonText}
            onChange={(e) => handleJsonChange(e.target.value)}
            placeholder={`Paste JSON array with ${expectedArgsCount} item(s)`}
          />

          <div className="mb-4">
            <input
              type="file"
              accept="application/json"
              onChange={handleFileUpload}
              className="block w-full cursor-pointer text-sm text-muted-foreground transition-colors file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-secondary file:px-4 file:py-2 file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-secondary/80"
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
