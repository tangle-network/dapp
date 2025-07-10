import React, { FC, useCallback, useState } from 'react';
import { RequestArgsConfigurationStepProps } from './type';
import { Card, Typography } from '@tangle-network/ui-components';
import ErrorMessage from '../../../../../components/ErrorMessage';

export const RequestArgsConfigurationStep: FC<
  RequestArgsConfigurationStepProps
> = ({ errors, setValue, watch: _watch, blueprint }) => {
  const [jsonText, setJsonText] = useState<string>('');

  const handleJsonChange = useCallback(
    (text: string) => {
      setJsonText(text);
      try {
        const parsed = JSON.parse(text);
        // Only accept an array – that is what the pallet expects.
        if (Array.isArray(parsed)) {
          setValue('requestArgs', parsed as unknown[]);
        }
      } catch {
        // Ignore parse errors; validation will show message.
      }
    },
    [setValue],
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

      {!blueprint?.requestParams?.length ? (
        <Typography variant="body1">No request arguments required.</Typography>
      ) : (
        <>
          <Typography variant="body2" className="mb-2">
            Paste or upload a JSON array representing the request arguments.
            Example:
          </Typography>

          <pre className="bg-mono-80 dark:bg-mono-160 rounded p-3 text-xs overflow-x-auto mb-3">
            {`[
  {
    "config": {
      "runtime": "docker",
      "package": "tangle-network/mcp-solidity-kit:latest",
      "args": [],
      "env": [],
      "transportAdapter": "none"
    }
  }
]`}
          </pre>

          <textarea
            className="w-full min-h-[180px] border border-mono-100 dark:border-mono-140 rounded p-3 text-sm font-mono mb-3 resize-vertical"
            value={jsonText}
            onChange={(e) => handleJsonChange(e.target.value)}
            placeholder="Paste JSON array here"
          />

          <div className="mb-4">
            <input
              type="file"
              accept="application/json"
              onChange={handleFileUpload}
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
