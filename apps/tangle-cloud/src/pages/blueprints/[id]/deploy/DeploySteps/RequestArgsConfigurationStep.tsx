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
          <Typography variant="body2" className="mb-4">
            Paste or upload a JSON array representing the request arguments.
          </Typography>

          <textarea
            className="w-full min-h-[180px] bg-mono-0 dark:bg-mono-180 border border-mono-60 dark:border-mono-120 rounded-lg p-4 text-sm font-mono mb-4 resize-vertical text-mono-160 dark:text-mono-40 placeholder:text-mono-100 dark:placeholder:text-mono-100 focus:border-blue-50 dark:focus:border-blue-50 focus:ring-1 focus:ring-blue-50 dark:focus:ring-blue-50 transition-colors"
            value={jsonText}
            onChange={(e) => handleJsonChange(e.target.value)}
            placeholder="Paste JSON array here"
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
