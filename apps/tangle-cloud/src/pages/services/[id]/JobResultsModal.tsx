/**
 * Modal showing job results from operators.
 * Decodes input/result payloads using TLV v2 schema when available.
 */

import {
  type ComponentProps,
  type FC,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Skeleton,
} from '@tangle-network/sandbox-ui/primitives';
import { Text } from '../../../components/sandbox/SandboxUi';
import {
  useJobResults,
  type JobCall,
  type JobResult,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import type { BlueprintJobDefinition } from '@tangle-network/tangle-shared-ui/data/services';
import {
  decodePayload,
  formatDecodedValue,
  type NamedDecodedField,
  type SchemaField,
} from '@tangle-network/tangle-shared-ui/codec';
import { twMerge } from 'tailwind-merge';

const EMPTY_VALUE_PLACEHOLDER = '-';

const Modal = Dialog;

const ModalContent: FC<
  ComponentProps<typeof DialogContent> & { size?: string }
> = ({ size: _size, ...props }) => (
  <DialogContent
    className="max-h-[85vh] overflow-y-auto sm:max-w-3xl"
    {...props}
  />
);

const ModalHeader: FC<ComponentProps<'div'>> = ({ children, ...props }) => (
  <DialogHeader {...props}>
    <DialogTitle>{children}</DialogTitle>
  </DialogHeader>
);

const ModalBody: FC<ComponentProps<'div'>> = ({ className = '', ...props }) => (
  <div
    className={['space-y-4', className].filter(Boolean).join(' ')}
    {...props}
  />
);

const ModalFooter = DialogFooter;

const CopyWithTooltip: FC<{
  textToCopy: string;
  copyLabel?: string;
  iconSize?: string;
  isButton?: boolean;
}> = ({ textToCopy, copyLabel = 'Copy' }) => (
  <button
    type="button"
    className="text-mono-120 dark:text-mono-100 text-xs underline-offset-4 hover:text-mono-200 dark:text-mono-0 hover:underline"
    onClick={() => void navigator.clipboard?.writeText(textToCopy)}
  >
    {copyLabel}
  </button>
);

interface Props {
  job: JobCall;
  jobDefinition?: BlueprintJobDefinition;
  onClose: () => void;
}

type PayloadViewMode = 'decoded' | 'raw';
type SchemaState =
  | 'SCHEMA_AVAILABLE'
  | 'SCHEMA_MISSING'
  | 'SCHEMA_PARSE_FAILED'
  | 'SCHEMA_DECODE_FAILED';

interface BestEffortPayload {
  kind: 'json' | 'text' | 'hex';
  value: string;
}

const hexToBytes = (hex: string): Uint8Array => {
  const cleaned = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (cleaned.length === 0) {
    return new Uint8Array(0);
  }
  if (cleaned.length % 2 !== 0) {
    throw new Error('Invalid hex length');
  }
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    const byte = parseInt(cleaned.substring(i * 2, i * 2 + 2), 16);
    if (Number.isNaN(byte)) {
      throw new Error('Invalid hex byte');
    }
    bytes[i] = byte;
  }
  return bytes;
};

const tryDecodeHex = (
  hex: string | null | undefined,
  schema: SchemaField[],
): NamedDecodedField[] | null => {
  if (!hex || schema.length === 0) {
    return null;
  }
  try {
    const bytes = hexToBytes(hex);
    return decodePayload(schema, bytes);
  } catch {
    return null;
  }
};

const decodeBestEffortPayload = (
  hex: string | null | undefined,
): BestEffortPayload => {
  if (!hex || hex === '0x') {
    return { kind: 'text', value: '' };
  }

  try {
    const bytes = hexToBytes(hex);
    try {
      const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      const trimmed = text.trim();

      if (trimmed.length === 0) {
        return { kind: 'text', value: text };
      }

      try {
        const parsed = JSON.parse(text);
        return { kind: 'json', value: JSON.stringify(parsed, null, 2) };
      } catch {
        return { kind: 'text', value: text };
      }
    } catch {
      return { kind: 'hex', value: hex };
    }
  } catch {
    return { kind: 'hex', value: hex };
  }
};

const resolveSchemaState = ({
  hasSchema,
  parseError,
  payloadHex,
  decodedPayload,
}: {
  hasSchema: boolean;
  parseError: string | null;
  payloadHex: string | null | undefined;
  decodedPayload: NamedDecodedField[] | null;
}): SchemaState => {
  if (parseError) {
    return 'SCHEMA_PARSE_FAILED';
  }
  if (!hasSchema) {
    return 'SCHEMA_MISSING';
  }
  if (payloadHex && payloadHex !== '0x' && !decodedPayload) {
    return 'SCHEMA_DECODE_FAILED';
  }
  return 'SCHEMA_AVAILABLE';
};

const DecodedFieldsDisplay: FC<{ fields: NamedDecodedField[] }> = ({
  fields,
}) => (
  <div className="space-y-2">
    {fields.map((field, i) => (
      <div
        key={i}
        className="flex flex-col gap-0.5 p-2 bg-mono-0 dark:bg-mono-190 rounded"
      >
        <Text variant="body3" className="text-mono-120 dark:text-mono-100">
          {field.name || `Field ${i}`}
        </Text>

        <Text variant="body2" className="font-mono text-sm break-all">
          {formatDecodedValue(field.value)}
        </Text>
      </div>
    ))}
  </div>
);

const PayloadContainer: FC<{
  children: ReactNode;
  copyText?: string | null;
  copyLabel: string;
}> = ({ children, copyText, copyLabel }) => (
  <div className="p-3 bg-mono-20/50 dark:bg-mono-190/50 rounded-lg">
    <div className="flex items-start gap-2">
      <div className="flex-1 min-w-0">{children}</div>
      {copyText && (
        <div className="mt-[2px]">
          <CopyWithTooltip
            textToCopy={copyText}
            copyLabel={copyLabel}
            iconSize="md"
            isButton={false}
          />
        </div>
      )}
    </div>
  </div>
);

const RawPayloadDisplay: FC<{
  hex: string | null | undefined;
}> = ({ hex }) => (
  <Text
    variant="body2"
    className="font-mono text-sm break-all whitespace-pre-wrap"
  >
    {hex ?? EMPTY_VALUE_PLACEHOLDER}
  </Text>
);

const BestEffortPayloadDisplay: FC<{ payload: BestEffortPayload }> = ({
  payload,
}) => (
  <Text
    variant="body2"
    className="font-mono text-sm break-all whitespace-pre-wrap"
  >
    {payload.value || EMPTY_VALUE_PLACEHOLDER}
  </Text>
);

const SchemaStateNotice: FC<{
  state: SchemaState;
  parseError?: string | null;
  bestEffortKind?: BestEffortPayload['kind'] | null;
}> = ({ state, parseError, bestEffortKind }) => {
  if (state === 'SCHEMA_AVAILABLE') {
    return null;
  }

  let message = '';
  if (state === 'SCHEMA_MISSING') {
    if (bestEffortKind === 'json') {
      message =
        'No schema is published for this payload. Displaying this as decoded JSON from UTF-8 text.';
    } else if (bestEffortKind === 'text') {
      message =
        'No schema is published for this payload. Displaying this as decoded UTF-8 text.';
    } else if (bestEffortKind === 'hex') {
      message =
        'No schema is published for this payload. The bytes are not valid UTF-8 text, so raw hex is shown.';
    } else {
      message = 'No schema is published for this payload.';
    }
  } else if (state === 'SCHEMA_PARSE_FAILED') {
    message = 'Published schema could not be parsed. Showing raw payload.';
  } else {
    message = 'Payload does not match published schema. Showing raw payload.';
  }

  return (
    <div className="mb-2 p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
      <Text variant="body3" className="text-yellow-300">
        {message}
      </Text>
      {parseError && state === 'SCHEMA_PARSE_FAILED' && (
        <Text variant="body3" className="text-yellow-200/80 mt-1">
          Parse error: {parseError}
        </Text>
      )}
    </div>
  );
};

const ViewModeToggle: FC<{
  mode: PayloadViewMode;
  onChange: (mode: PayloadViewMode) => void;
}> = ({ mode, onChange }) => (
  <div className="inline-flex rounded-md border border-mono-60 dark:border-mono-170 overflow-hidden">
    {(['decoded', 'raw'] as const).map((candidate) => (
      <button
        key={candidate}
        type="button"
        className={twMerge(
          'px-3 py-1 text-xs capitalize',
          mode === candidate
            ? 'bg-purple-40 text-purple-40-foreground'
            : 'bg-mono-20/50 dark:bg-mono-190/50 text-mono-120 dark:text-mono-100 hover:text-mono-200 dark:text-mono-0',
        )}
        onClick={() => onChange(candidate)}
      >
        {candidate}
      </button>
    ))}
  </div>
);

const PayloadSection: FC<{
  payloadHex: string | null | undefined;
  decodedPayload: NamedDecodedField[] | null;
  schemaState: SchemaState;
  schemaParseError: string | null;
  mode: PayloadViewMode;
  onModeChange: (mode: PayloadViewMode) => void;
  copyText?: string | null;
  copyLabel: string;
}> = ({
  payloadHex,
  decodedPayload,
  schemaState,
  schemaParseError,
  mode,
  onModeChange,
  copyText,
  copyLabel,
}) => {
  const bestEffortPayload = useMemo(
    () =>
      schemaState === 'SCHEMA_MISSING'
        ? decodeBestEffortPayload(payloadHex)
        : null,
    [payloadHex, schemaState],
  );

  return (
    <>
      <SchemaStateNotice
        state={schemaState}
        parseError={schemaParseError}
        bestEffortKind={bestEffortPayload?.kind ?? null}
      />
      <div className="mb-2">
        <ViewModeToggle mode={mode} onChange={onModeChange} />
      </div>

      <PayloadContainer copyText={copyText} copyLabel={copyLabel}>
        {mode === 'raw' ? (
          <RawPayloadDisplay hex={payloadHex} />
        ) : decodedPayload ? (
          <DecodedFieldsDisplay fields={decodedPayload} />
        ) : bestEffortPayload ? (
          bestEffortPayload.kind === 'hex' ? (
            <RawPayloadDisplay hex={bestEffortPayload.value} />
          ) : (
            <BestEffortPayloadDisplay payload={bestEffortPayload} />
          )
        ) : (
          <RawPayloadDisplay hex={payloadHex} />
        )}
      </PayloadContainer>
    </>
  );
};

export const JobResultsModal: FC<Props> = ({ job, jobDefinition, onClose }) => {
  const { data: results, isLoading } = useJobResults(job.id);
  const [inputMode, setInputMode] = useState<PayloadViewMode>('decoded');

  const jobName = jobDefinition?.name;
  const headerTitle = jobName
    ? `Job Results - ${jobName} (#${job.callId.toString()})`
    : `Job Results - Call #${job.callId.toString()}`;

  const decodedInputs = useMemo(
    () => tryDecodeHex(job.inputs, jobDefinition?.parsedParamsSchema ?? []),
    [job.inputs, jobDefinition?.parsedParamsSchema],
  );

  const hasParamsSchema =
    jobDefinition?.hasParamsSchema ??
    (!!jobDefinition?.paramsSchema && jobDefinition.paramsSchema !== '0x');
  const paramsSchemaParseError = jobDefinition?.paramsSchemaParseError ?? null;
  const inputSchemaState = resolveSchemaState({
    hasSchema: hasParamsSchema,
    parseError: paramsSchemaParseError,
    payloadHex: job.inputs,
    decodedPayload: decodedInputs,
  });

  return (
    <Modal open onOpenChange={(open: boolean) => !open && onClose()}>
      <ModalContent size="lg">
        <ModalHeader>{headerTitle}</ModalHeader>
        <ModalBody>
          {/* Job Info */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-mono-20/50 dark:bg-mono-190/50 rounded-lg">
            <div>
              <Text
                variant="body3"
                className="text-mono-120 dark:text-mono-100"
              >
                Job Index
              </Text>
              <Text variant="body1" fw="semibold">
                {job.jobIndex}
                {jobName ? ` (${jobName})` : ''}
              </Text>
            </div>
            <div>
              <Text
                variant="body3"
                className="text-mono-120 dark:text-mono-100"
              >
                Status
              </Text>
              <span
                className={twMerge(
                  'px-2 py-1 rounded text-xs inline-block',
                  job.completed
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400',
                )}
              >
                {job.completed ? 'Completed' : 'Pending'}
              </span>
            </div>
            <div>
              <Text
                variant="body3"
                className="text-mono-120 dark:text-mono-100"
              >
                Submitted
              </Text>
              <Text variant="body1">
                {new Date(Number(job.submittedAt) * 1000).toLocaleString()}
              </Text>
            </div>
            <div>
              <Text
                variant="body3"
                className="text-mono-120 dark:text-mono-100"
              >
                Results Received
              </Text>
              <Text variant="body1">{job.resultCount}</Text>
            </div>
          </div>

          {/* Input Data */}
          <div className="mb-6">
            <Text variant="h5" fw="semibold" className="mb-2">
              Input Data
            </Text>

            <PayloadSection
              payloadHex={job.inputs}
              decodedPayload={decodedInputs}
              schemaState={inputSchemaState}
              schemaParseError={paramsSchemaParseError}
              mode={inputMode}
              onModeChange={setInputMode}
              copyText={job.inputs}
              copyLabel="Copy raw input"
            />
          </div>

          {/* Results */}
          <div>
            <Text variant="h5" fw="semibold" className="mb-2">
              Operator Results
            </Text>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : results && results.length > 0 ? (
              <div className="space-y-3">
                {results.map((result: JobResult) => (
                  <OperatorResultCard
                    key={result.id}
                    result={result}
                    resultSchema={jobDefinition?.parsedResultSchema ?? []}
                    hasSchema={
                      jobDefinition?.hasResultSchema ??
                      (!!jobDefinition?.resultSchema &&
                        jobDefinition.resultSchema !== '0x')
                    }
                    schemaParseError={
                      jobDefinition?.resultSchemaParseError ?? null
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No results received yet"
                description="Operators are processing this job."
              />
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const OperatorResultCard: FC<{
  result: JobResult;
  resultSchema: SchemaField[];
  hasSchema: boolean;
  schemaParseError: string | null;
}> = ({ result, resultSchema, hasSchema, schemaParseError }) => {
  const [resultMode, setResultMode] = useState<PayloadViewMode>('decoded');

  const decodedResult = useMemo(
    () => tryDecodeHex(result.result, resultSchema),
    [result.result, resultSchema],
  );

  const resultSchemaState = resolveSchemaState({
    hasSchema,
    parseError: schemaParseError,
    payloadHex: result.result,
    decodedPayload: decodedResult,
  });

  return (
    <div className="p-4 border border-mono-60 dark:border-mono-170 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <div>
          <Text variant="body3" className="text-mono-120 dark:text-mono-100">
            {result.aggregated ? 'Source' : 'Operator'}
          </Text>
          <Text variant="body2" className="font-mono">
            {result.aggregated
              ? 'Aggregated Result'
              : result.operator
                ? `${result.operator.slice(0, 10)}...${result.operator.slice(-8)}`
                : EMPTY_VALUE_PLACEHOLDER}
          </Text>
        </div>
        <div className="text-right">
          <Text variant="body3" className="text-mono-120 dark:text-mono-100">
            Submitted
          </Text>
          <Text variant="body2">
            {new Date(Number(result.submittedAt) * 1000).toLocaleString()}
          </Text>
        </div>
      </div>
      <div>
        <Text variant="body3" className="text-mono-120 dark:text-mono-100 mb-1">
          {result.aggregated ? 'Aggregated Output' : 'Result'}
        </Text>

        <PayloadSection
          payloadHex={result.result}
          decodedPayload={decodedResult}
          schemaState={resultSchemaState}
          schemaParseError={schemaParseError}
          mode={resultMode}
          onModeChange={setResultMode}
          copyText={result.result}
          copyLabel="Copy raw result"
        />
      </div>
    </div>
  );
};

export default JobResultsModal;
