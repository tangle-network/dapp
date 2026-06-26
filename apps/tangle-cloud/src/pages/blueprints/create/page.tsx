/**
 * Blueprint creation wizard - multi-step form for creating new blueprints.
 */

import {
  type ChangeEvent,
  type ComponentProps,
  type FC,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { Text } from '../../../components/sandbox/SandboxUi';
import { useNavigate } from 'react-router';
import { useAccount } from 'wagmi';
import {
  Button as SandboxButton,
  Card,
  InlineCode,
  Input as SandboxInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tangle-network/sandbox-ui/primitives';
import { ArrowLeft, CheckboxCircleFill } from '@tangle-network/icons';
import {
  useCreateBlueprintTx,
  type BlueprintDefinition,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import {
  computeBlueprintMetadataPayloadHash,
  isAllowedBlueprintMetadataUri,
} from '@tangle-network/tangle-shared-ui/blueprintApps/authoring';
import { requiresIpfsForBlueprintMetadata } from '@tangle-network/tangle-shared-ui/blueprintApps/runtime';
import {
  parseSchemaJson,
  encodeSchemaToHex,
} from '@tangle-network/tangle-shared-ui/codec';
import ErrorMessage from '@tangle-network/tangle-shared-ui/components/ErrorMessage';
import { PagePath } from '../../../types';
import { zeroAddress, type Address, toHex } from 'viem';
import {
  buildBlueprintUiMetadataDocument,
  DEFAULT_BLUEPRINT_UI_DRAFT,
  type BlueprintUiAuthoringDraft,
} from '../../../blueprintApps/authoring';
import type {
  BlueprintResourceRoute,
  BlueprintUiSurface,
} from '../../../blueprintApps/types';
import RequireWallet from '../../../components/RequireWallet';

const CARD_SURFACE = 'sandbox' as const;

type ButtonProps = Omit<
  ComponentProps<typeof SandboxButton>,
  'variant' | 'size'
> & {
  variant?: ComponentProps<typeof SandboxButton>['variant'] | 'utility';
  size?: ComponentProps<typeof SandboxButton>['size'];
  isDisabled?: boolean;
  isLoading?: boolean;
  isJustIcon?: boolean;
};

const Button: FC<ButtonProps> = ({
  variant,
  size,
  isDisabled,
  isLoading,
  isJustIcon,
  disabled,
  ...props
}) => (
  <SandboxButton
    variant={variant === 'utility' ? 'outline' : variant}
    size={isJustIcon ? 'icon' : size}
    disabled={disabled || isDisabled}
    loading={isLoading}
    {...props}
  />
);

type InputProps = Omit<ComponentProps<typeof SandboxInput>, 'onChange'> & {
  isControlled?: boolean;
  onChange?: (value: string) => void;
};

const Input: FC<InputProps> = ({
  isControlled: _isControlled,
  onChange,
  ...props
}) => (
  <SandboxInput
    {...props}
    onChange={(event: ChangeEvent<HTMLInputElement>) =>
      onChange?.(event.currentTarget.value)
    }
  />
);

// Wizard steps
enum Step {
  BasicInfo = 0,
  Configuration = 1,
  Jobs = 2,
  Sources = 3,
  Review = 4,
}

const STEP_LABELS = [
  'Basic Info',
  'Configuration',
  'Jobs',
  'Sources',
  'Review',
];

// Simplified job form
interface JobForm {
  name: string;
  description: string;
  paramsSchemaJson: string;
  resultSchemaJson: string;
}

const DEFAULT_PARAMS_SCHEMA_JSON = JSON.stringify(
  [{ kind: 'String', name: 'input' }],
  null,
  2,
);

const DEFAULT_RESULT_SCHEMA_JSON = JSON.stringify(
  [{ kind: 'String', name: 'output' }],
  null,
  2,
);

const BLUEPRINT_UI_SURFACE_OPTIONS: Array<{
  value: BlueprintUiSurface;
  label: string;
}> = [
  { value: 'generic-overview', label: 'Overview' },
  { value: 'service-explorer', label: 'Service explorer' },
  { value: 'service-console', label: 'Service console' },
  { value: 'actions-panel', label: 'Actions' },
  { value: 'resources', label: 'Resources' },
  { value: 'chat', label: 'Chat' },
  { value: 'vaults', label: 'Vaults' },
  { value: 'metrics', label: 'Metrics' },
  { value: 'permissions', label: 'Permissions' },
];

const BLUEPRINT_RESOURCE_ROUTE_OPTIONS: Array<{
  value: BlueprintResourceRoute;
  label: string;
}> = [
  { value: 'custom', label: 'Custom resources' },
  { value: 'bots', label: 'Bots' },
  { value: 'agents', label: 'Agents' },
  { value: 'runs', label: 'Runs' },
  { value: 'vault', label: 'Vaults' },
  { value: 'chat', label: 'Chat sessions' },
];

const compileSchemaJsonToHex = (
  schemaJson: string,
  schemaLabel: string,
): `0x${string}` => {
  const fields = parseSchemaJson(schemaJson);
  if (fields.length === 0) {
    throw new Error(`${schemaLabel} must define at least one field`);
  }
  return encodeSchemaToHex(fields);
};

// Binary form for each source
interface BinaryForm {
  arch: number; // BlueprintArchitecture enum (0-9)
  os: number; // BlueprintOperatingSystem enum (0-4)
  name: string;
  sha256: string; // 0x + 64 hex chars
}

// Simplified source form
interface SourceForm {
  kind: 'Container' | 'Wasm' | 'Native';
  registry?: string;
  image?: string;
  tag?: string;
  artifactUri?: string;
  entrypoint?: string;
  binaries: BinaryForm[]; // At least 1 required per source
}

// Form state (simplified for user input)
interface FormState {
  // Metadata
  name: string;
  description: string;
  author: string;
  category: string;
  codeRepository: string;
  logo: string;
  website: string;
  license: string;
  metadataUri: string;
  manager: string;
  uiDraft: BlueprintUiAuthoringDraft;
  // Configuration
  membership: 'Fixed' | 'Dynamic';
  pricing: 'PayOnce' | 'Subscription' | 'EventDriven';
  minOperators: number;
  maxOperators: number;
  subscriptionRate: string;
  subscriptionInterval: string;
  eventRate: string;
  // Jobs
  jobs: JobForm[];
  // Schemas
  registrationSchema: string;
  requestSchema: string;
  // Sources
  sources: SourceForm[];
}

const initialFormState: FormState = {
  name: '',
  description: '',
  author: '',
  category: '',
  codeRepository: '',
  logo: '',
  website: '',
  license: 'MIT',
  metadataUri: '',
  manager: '',
  uiDraft: DEFAULT_BLUEPRINT_UI_DRAFT,
  membership: 'Fixed',
  pricing: 'PayOnce',
  minOperators: 1,
  maxOperators: 10,
  subscriptionRate: '0',
  subscriptionInterval: '2592000',
  eventRate: '0',
  jobs: [],
  registrationSchema: '{}',
  requestSchema: '{}',
  sources: [],
};

const buildMetadataDocument = (form: FormState) =>
  buildBlueprintUiMetadataDocument({
    name: form.name,
    description: form.description,
    category: form.category,
    codeRepository: form.codeRepository,
    logo: form.logo,
    website: form.website,
    author: form.author,
    draft: form.uiDraft,
  });

// Convert form to ABI-compatible definition
const formToDefinition = (
  form: FormState,
  address: Address,
): BlueprintDefinition => {
  const membershipNum = form.membership === 'Fixed' ? 0 : 1;
  const pricingNum =
    form.pricing === 'PayOnce' ? 0 : form.pricing === 'Subscription' ? 1 : 2;

  // Convert schemas to hex bytes
  const registrationBytes = toHex(
    new TextEncoder().encode(form.registrationSchema),
  );
  const requestBytes = toHex(new TextEncoder().encode(form.requestSchema));
  const metadataDocument = buildMetadataDocument(form);

  // Convert jobs
  const jobs = form.jobs.map((job, index) => ({
    name: job.name,
    description: job.description,
    metadataUri: '',
    paramsSchema: compileSchemaJsonToHex(
      job.paramsSchemaJson,
      `Job ${index + 1} params schema`,
    ),
    resultSchema: compileSchemaJsonToHex(
      job.resultSchemaJson,
      `Job ${index + 1} result schema`,
    ),
  }));

  // Convert sources
  const sources = form.sources.map((source) => {
    const kindNum =
      source.kind === 'Container' ? 0 : source.kind === 'Wasm' ? 1 : 2;
    return {
      kind: kindNum,
      container: {
        registry: source.registry || '',
        image: source.image || '',
        tag: source.tag || 'latest',
      },
      wasm: {
        runtime: 0,
        fetcher: 0,
        artifactUri: source.artifactUri || '',
        entrypoint: source.entrypoint || '',
      },
      native: {
        fetcher: 0,
        artifactUri: source.artifactUri || '',
        entrypoint: source.entrypoint || '',
      },
      testing: {
        cargoPackage: '',
        cargoBin: '',
        basePath: '',
      },
      binaries: source.binaries.map((bin) => ({
        arch: bin.arch,
        os: bin.os,
        name: bin.name,
        sha256: bin.sha256 as `0x${string}`,
      })),
    };
  });

  return {
    metadataUri: form.metadataUri,
    metadataHash: computeBlueprintMetadataPayloadHash(metadataDocument),
    manager: (form.manager || zeroAddress) as Address,
    masterManagerRevision: 0,
    hasConfig: true,
    config: {
      membership: membershipNum,
      pricing: pricingNum,
      minOperators: form.minOperators,
      maxOperators: form.maxOperators,
      subscriptionRate: BigInt(form.subscriptionRate),
      subscriptionInterval: BigInt(form.subscriptionInterval),
      eventRate: BigInt(form.eventRate),
    },
    metadata: {
      name: form.name,
      description: form.description,
      author: form.author || address,
      category: form.category,
      codeRepository: form.codeRepository,
      logo: form.logo,
      website: form.website,
      license: form.license,
      profilingData: '',
    },
    jobs,
    registrationSchema: registrationBytes,
    requestSchema: requestBytes,
    sources,
    // 0 = Fixed, 1 = Dynamic - include the selected membership model
    supportedMemberships: form.membership === 'Fixed' ? [0] : [1],
  };
};

const buildMetadataPreview = (form: FormState): string =>
  JSON.stringify(buildMetadataDocument(form), null, 2);

const toggleBlueprintSurface = (
  draft: BlueprintUiAuthoringDraft,
  surface: BlueprintUiSurface,
): BlueprintUiAuthoringDraft => {
  const nextSurfaces = draft.surfaces.includes(surface)
    ? draft.surfaces.filter((value: BlueprintUiSurface) => value !== surface)
    : [...draft.surfaces, surface];

  return {
    ...draft,
    surfaces: nextSurfaces,
  };
};

const CreateBlueprintPage: FC = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { createBlueprint, status, error, reset } = useCreateBlueprintTx();

  const [step, setStep] = useState<Step>(Step.BasicInfo);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [validationError, setValidationError] = useState<string | null>(null);
  const metadataPreview = useMemo(() => buildMetadataPreview(form), [form]);

  const isSubmitting = status === 'pending';
  const isSuccess = status === 'success';

  const updateForm = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setValidationError(null);
    },
    [],
  );

  const validateStep = useCallback(() => {
    switch (step) {
      case Step.BasicInfo:
        if (!form.name.trim()) {
          setValidationError('Blueprint name is required');
          return false;
        }
        if (!form.metadataUri.trim()) {
          setValidationError('Metadata URI is required');
          return false;
        }
        if (!/^(ipfs:\/\/|https?:\/\/).+/.test(form.metadataUri.trim())) {
          setValidationError(
            'Metadata URI must start with ipfs://, https://, or http://',
          );
          return false;
        }
        if (!isAllowedBlueprintMetadataUri(form.metadataUri.trim())) {
          setValidationError(
            'Production hosted blueprints must publish metadata to an ipfs:// URI.',
          );
          return false;
        }
        if (form.uiDraft.surfaces.length === 0) {
          setValidationError(
            'Select at least one shared host surface for blueprintUi metadata',
          );
          return false;
        }
        if (
          form.uiDraft.externalAppUrl.trim() &&
          !/^https:\/\/.+/.test(form.uiDraft.externalAppUrl.trim())
        ) {
          setValidationError('External app URL must start with https://');
          return false;
        }
        break;
      case Step.Configuration:
        if (form.minOperators < 1) {
          setValidationError('Minimum operators must be at least 1');
          return false;
        }
        if (form.maxOperators > 0 && form.maxOperators < form.minOperators) {
          setValidationError(
            'Maximum operators must be greater than minimum operators',
          );
          return false;
        }
        break;
      case Step.Jobs:
        if (form.jobs.length === 0) {
          setValidationError('At least one job is required');
          return false;
        }
        for (let i = 0; i < form.jobs.length; i++) {
          const job = form.jobs[i];
          if (!job.name.trim()) {
            setValidationError(`Job ${i + 1} name is required`);
            return false;
          }

          if (!job.paramsSchemaJson.trim()) {
            setValidationError(`Job ${i + 1} params schema is required`);
            return false;
          }

          if (!job.resultSchemaJson.trim()) {
            setValidationError(`Job ${i + 1} result schema is required`);
            return false;
          }

          try {
            compileSchemaJsonToHex(
              job.paramsSchemaJson,
              `Job ${i + 1} params schema`,
            );
            compileSchemaJsonToHex(
              job.resultSchemaJson,
              `Job ${i + 1} result schema`,
            );
          } catch (error) {
            setValidationError(
              error instanceof Error
                ? error.message
                : `Job ${i + 1} schema is invalid`,
            );
            return false;
          }
        }
        break;
      case Step.Sources:
        if (form.sources.length === 0) {
          setValidationError('At least one source is required');
          return false;
        }
        for (let i = 0; i < form.sources.length; i++) {
          const source = form.sources[i];
          if (source.binaries.length === 0) {
            setValidationError(`Source ${i + 1} must have at least one binary`);
            return false;
          }
          for (let j = 0; j < source.binaries.length; j++) {
            const bin = source.binaries[j];
            if (!bin.sha256.trim()) {
              setValidationError(
                `Source ${i + 1}, Binary ${j + 1}: SHA256 hash is required`,
              );
              return false;
            }
            if (!/^0x[a-fA-F0-9]{64}$/.test(bin.sha256)) {
              setValidationError(
                `Source ${i + 1}, Binary ${j + 1}: SHA256 must be 0x + 64 hex characters`,
              );
              return false;
            }
            if (bin.sha256 === '0x' + '0'.repeat(64)) {
              setValidationError(
                `Source ${i + 1}, Binary ${j + 1}: SHA256 cannot be all zeros`,
              );
              return false;
            }
          }
        }
        break;
    }
    setValidationError(null);
    return true;
  }, [step, form]);

  const handleNext = useCallback(() => {
    if (!validateStep()) return;
    setStep((prev) => Math.min(prev + 1, Step.Review));
  }, [validateStep]);

  const handleBack = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, Step.BasicInfo));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateStep() || !address) return;

    try {
      const definition = formToDefinition(form, address);
      await createBlueprint(definition);
    } catch (submitError) {
      setValidationError(
        submitError instanceof Error
          ? submitError.message
          : 'Failed to build blueprint definition',
      );
    }
  }, [form, address, createBlueprint, validateStep]);

  const handleCopyMetadataPreview = useCallback(async () => {
    await navigator.clipboard.writeText(metadataPreview);
  }, [metadataPreview]);

  // Add job helper
  const addJob = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      jobs: [
        ...prev.jobs,
        {
          name: '',
          description: '',
          paramsSchemaJson: DEFAULT_PARAMS_SCHEMA_JSON,
          resultSchemaJson: DEFAULT_RESULT_SCHEMA_JSON,
        },
      ],
    }));
  }, []);

  // Update job helper
  const updateJob = useCallback((index: number, updates: Partial<JobForm>) => {
    setForm((prev) => ({
      ...prev,
      jobs: prev.jobs.map((job, i) =>
        i === index ? { ...job, ...updates } : job,
      ),
    }));
  }, []);

  // Remove job helper
  const removeJob = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      jobs: prev.jobs.filter((_, i) => i !== index),
    }));
  }, []);

  // Add source helper
  const addSource = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      sources: [...prev.sources, { kind: 'Container', binaries: [] }],
    }));
  }, []);

  // Update source helper
  const updateSource = useCallback(
    (index: number, updates: Partial<SourceForm>) => {
      setForm((prev) => ({
        ...prev,
        sources: prev.sources.map((source, i) =>
          i === index ? { ...source, ...updates } : source,
        ),
      }));
    },
    [],
  );

  // Remove source helper
  const removeSource = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      sources: prev.sources.filter((_, i) => i !== index),
    }));
  }, []);

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div>
          <Text variant="h4" fw="bold">
            Create blueprint
          </Text>
          <Text
            variant="body1"
            className="text-mono-100 dark:text-mono-60 mt-1"
          >
            Publish a blueprint definition, service schema, and hosted UI
            metadata.
          </Text>
        </div>
        <RequireWallet
          eyebrow="Create blueprint"
          title="Connect a publisher wallet"
          description="A wallet connection is required to submit the blueprint transaction and bind metadata to the on-chain record."
          checks={['Blueprint schema', 'Metadata URI', 'Publish transaction']}
        />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <CheckboxCircleFill className="w-16 h-16 text-green-500 mb-4" />
        <Text variant="h4" className="text-center">
          Blueprint Created!
        </Text>
        <Text
          variant="body1"
          className="text-mono-100 dark:text-mono-60 mt-2 mb-6 text-center"
        >
          Your blueprint has been created successfully.
        </Text>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate(PagePath.BLUEPRINTS_MANAGE)}>
            Manage Blueprints
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              reset();
              setForm(initialFormState);
              setStep(Step.BasicInfo);
            }}
          >
            Create Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="utility"
          isJustIcon
          onClick={() => navigate(PagePath.BLUEPRINTS)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <Text variant="h4" fw="bold">
            Create Blueprint
          </Text>
          <Text variant="body2" className="text-mono-100 dark:text-mono-60">
            Define a new blueprint for operators to register with.
          </Text>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {STEP_LABELS.map((label, index) => (
          <div key={label} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                index === step
                  ? 'bg-purple-40 text-purple-40-foreground'
                  : index < step
                    ? 'bg-success text-purple-40-foreground'
                    : 'bg-mono-20 dark:bg-mono-190 text-mono-100 dark:text-mono-60'
              }`}
            >
              {index < step ? '✓' : index + 1}
            </div>
            <Text
              variant="body2"
              className={`ml-2 ${index === step ? 'text-mono-200 dark:text-mono-0' : 'text-mono-100 dark:text-mono-60'}`}
            >
              {label}
            </Text>
            {index < STEP_LABELS.length - 1 && (
              <div className="w-8 h-px bg-border mx-4" />
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <Card variant={CARD_SURFACE} className="p-6">
        {step === Step.BasicInfo && (
          <BasicInfoStep
            form={form}
            updateForm={updateForm}
            metadataPreview={metadataPreview}
            onCopyMetadataPreview={handleCopyMetadataPreview}
          />
        )}
        {step === Step.Configuration && (
          <ConfigurationStep form={form} updateForm={updateForm} />
        )}
        {step === Step.Jobs && (
          <JobsStep
            form={form}
            addJob={addJob}
            updateJob={updateJob}
            removeJob={removeJob}
          />
        )}
        {step === Step.Sources && (
          <SourcesStep
            form={form}
            updateForm={updateForm}
            addSource={addSource}
            updateSource={updateSource}
            removeSource={removeSource}
          />
        )}
        {step === Step.Review && (
          <ReviewStep
            form={form}
            metadataPreview={metadataPreview}
            onCopyMetadataPreview={handleCopyMetadataPreview}
          />
        )}

        {/* Errors */}
        {validationError && (
          <div className="mt-4">
            <ErrorMessage>{validationError}</ErrorMessage>
          </div>
        )}
        {error && (
          <div className="mt-4">
            <ErrorMessage>{error.message}</ErrorMessage>
          </div>
        )}
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={handleBack}
          isDisabled={step === Step.BasicInfo || isSubmitting}
        >
          Back
        </Button>

        {step === Step.Review ? (
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create'}
          </Button>
        ) : (
          <Button onClick={handleNext}>Next</Button>
        )}
      </div>
    </div>
  );
};

// Step Components
interface StepProps {
  form: FormState;
  updateForm: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}

interface BasicInfoStepProps extends StepProps {
  metadataPreview: string;
  onCopyMetadataPreview: () => void | Promise<void>;
}

const BasicInfoStep: FC<BasicInfoStepProps> = ({
  form,
  updateForm,
  metadataPreview,
  onCopyMetadataPreview,
}) => (
  <div className="space-y-4">
    <Text variant="h5" fw="bold" className="mb-4">
      Basic Information
    </Text>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <Text variant="body2" className="mb-2">
          Blueprint Name *
        </Text>
        <Input
          id="name"
          value={form.name}
          onChange={(v) => updateForm('name', v)}
          placeholder="Enter blueprint name"
          isControlled
        />
      </div>

      <div>
        <Text variant="body2" className="mb-2">
          Author
        </Text>
        <Input
          id="author"
          value={form.author}
          onChange={(v) => updateForm('author', v)}
          placeholder="Your name or address"
          isControlled
        />
      </div>
    </div>

    <div>
      <Text variant="body2" className="mb-2">
        Description
      </Text>
      <textarea
        className="w-full h-24 p-3 rounded-lg border border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-190 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        placeholder="Describe what your blueprint does"
        value={form.description}
        onChange={(e) => updateForm('description', e.target.value)}
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <Text variant="body2" className="mb-2">
          Category
        </Text>
        <Input
          id="category"
          value={form.category}
          onChange={(v) => updateForm('category', v)}
          placeholder="e.g., DeFi, Oracle, Compute"
          isControlled
        />
      </div>

      <div>
        <Text variant="body2" className="mb-2">
          License
        </Text>
        <Input
          id="license"
          value={form.license}
          onChange={(v) => updateForm('license', v)}
          placeholder="MIT"
          isControlled
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <Text variant="body2" className="mb-2">
          Code Repository
        </Text>
        <Input
          id="codeRepository"
          value={form.codeRepository}
          onChange={(v) => updateForm('codeRepository', v)}
          placeholder="https://github.com/..."
          isControlled
        />
      </div>

      <div>
        <Text variant="body2" className="mb-2">
          Website
        </Text>
        <Input
          id="website"
          value={form.website}
          onChange={(v) => updateForm('website', v)}
          placeholder="https://..."
          isControlled
        />
      </div>
    </div>

    <div>
      <Text variant="body2" className="mb-2">
        Logo URL
      </Text>
      <Input
        id="logo"
        value={form.logo}
        onChange={(v) => updateForm('logo', v)}
        placeholder="https://... or ipfs://..."
        isControlled
      />
    </div>

    <div>
      <Text variant="body2" className="mb-2">
        Metadata URI *
      </Text>
      <Input
        id="metadataUri"
        value={form.metadataUri}
        onChange={(v) => updateForm('metadataUri', v)}
        placeholder="ipfs://... or https://..."
        isControlled
      />
      <Text variant="body3" className="text-mono-100 dark:text-mono-60 mt-1">
        Publish the JSON preview below at this URI so cloud.tangle.tools can
        resolve your hosted blueprint surfaces and shared runtime metadata. New
        SDK blueprints ship the same contract shape in
        `metadata/blueprint-metadata.json`.
        {requiresIpfsForBlueprintMetadata()
          ? ' Production hosting only accepts ipfs:// metadata URIs.'
          : ' Local development can still use https:// metadata previews.'}
      </Text>
    </div>

    <div>
      <Text variant="body2" className="mb-2">
        Service Manager Contract (optional)
      </Text>
      <Input
        id="manager"
        value={form.manager}
        onChange={(v) => updateForm('manager', v)}
        placeholder="0x... (leave empty for none)"
        isControlled
      />
    </div>

    <div className="rounded-xl border border-mono-60 dark:border-mono-170 p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Text variant="body1" fw="semibold">
            Shared host metadata
          </Text>
          <Text
            variant="body3"
            className="text-mono-100 dark:text-mono-60 mt-1"
          >
            This drives the shared hosted blueprint pages, generic service
            surfaces, optional safe link-out handoff for publisher apps, and
            richer tier-2 cards, forms, resource views, theming, and approved
            modules when present in the published JSON.
          </Text>
        </div>
        <Button variant="secondary" size="sm" onClick={onCopyMetadataPreview}>
          Copy JSON
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Text variant="body2" className="mb-2">
            Requested slug
          </Text>
          <Input
            id="requestedSlug"
            value={form.uiDraft.requestedSlug}
            onChange={(v) =>
              updateForm('uiDraft', { ...form.uiDraft, requestedSlug: v })
            }
            placeholder="trading"
            isControlled
          />
        </div>
        <div>
          <Text variant="body2" className="mb-2">
            Publisher namespace
          </Text>
          <Input
            id="publisherNamespace"
            value={form.uiDraft.publisherNamespace}
            onChange={(v) =>
              updateForm('uiDraft', {
                ...form.uiDraft,
                publisherNamespace: v,
              })
            }
            placeholder="tangle or your project"
            isControlled
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Text variant="body2" className="mb-2">
            Service label
          </Text>
          <Input
            id="serviceNoun"
            value={form.uiDraft.serviceNoun}
            onChange={(v) =>
              updateForm('uiDraft', { ...form.uiDraft, serviceNoun: v })
            }
            placeholder="service"
            isControlled
          />
        </div>
        <div>
          <Text variant="body2" className="mb-2">
            Resource label
          </Text>
          <Input
            id="resourceNoun"
            value={form.uiDraft.resourceNoun}
            onChange={(v) =>
              updateForm('uiDraft', { ...form.uiDraft, resourceNoun: v })
            }
            placeholder="bot"
            isControlled
          />
        </div>
        <div>
          <Text variant="body2" className="mb-2">
            Resource route
          </Text>
          <Select
            value={form.uiDraft.resourceRoute}
            onValueChange={(v: string) =>
              updateForm('uiDraft', {
                ...form.uiDraft,
                resourceRoute: v as BlueprintResourceRoute,
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BLUEPRINT_RESOURCE_ROUTE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Text variant="body2" className="mb-2">
          Host surfaces
        </Text>
        <div className="flex flex-wrap gap-2">
          {BLUEPRINT_UI_SURFACE_OPTIONS.map((option) => {
            const isSelected = form.uiDraft.surfaces.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  isSelected
                    ? 'border-purple-40 bg-purple-40 text-purple-40-foreground'
                    : 'border-mono-60 dark:border-mono-170 bg-transparent text-mono-100 dark:text-mono-60'
                }`}
                onClick={() =>
                  updateForm(
                    'uiDraft',
                    toggleBlueprintSurface(form.uiDraft, option.value),
                  )
                }
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Text variant="body2" className="mb-2">
            External app URL
          </Text>
          <Input
            id="externalAppUrl"
            value={form.uiDraft.externalAppUrl}
            onChange={(v) =>
              updateForm('uiDraft', { ...form.uiDraft, externalAppUrl: v })
            }
            placeholder="https://app.example.com"
            isControlled
          />
        </div>
        <div>
          <Text variant="body2" className="mb-2">
            External app mode
          </Text>
          <Select
            value={form.uiDraft.externalAppMode}
            onValueChange={(v: string) =>
              updateForm('uiDraft', {
                ...form.uiDraft,
                externalAppMode:
                  v as BlueprintUiAuthoringDraft['externalAppMode'],
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="link">Link out</SelectItem>
            </SelectContent>
          </Select>
          <Text
            variant="body3"
            className="text-mono-100 dark:text-mono-60 mt-1"
          >
            Third-party iframe embedding is disabled. Publisher apps can only
            open in a new tab after trust and provenance checks pass.
          </Text>
        </div>
      </div>

      <div>
        <Text variant="body2" className="mb-2">
          Metadata JSON preview
        </Text>
        <textarea
          className="w-full min-h-64 p-3 rounded-lg border border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-190 font-mono text-sm resize-y focus:outline-none"
          value={metadataPreview}
          readOnly
        />
      </div>
    </div>
  </div>
);

const ConfigurationStep: FC<StepProps> = ({ form, updateForm }) => (
  <div className="space-y-4">
    <Text variant="h5" fw="bold" className="mb-4">
      Blueprint Configuration
    </Text>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <Text variant="body2" className="mb-2">
          Membership Model
        </Text>
        <Select
          value={form.membership}
          onValueChange={(v: string) =>
            updateForm('membership', v as 'Fixed' | 'Dynamic')
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Fixed">Fixed (specific operators)</SelectItem>
            <SelectItem value="Dynamic">Dynamic (any registered)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Text variant="body2" className="mb-2">
          Pricing Model
        </Text>
        <Select
          value={form.pricing}
          onValueChange={(v: string) =>
            updateForm(
              'pricing',
              v as 'PayOnce' | 'Subscription' | 'EventDriven',
            )
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PayOnce">Pay Once</SelectItem>
            <SelectItem value="Subscription">Subscription</SelectItem>
            <SelectItem value="EventDriven">Event Driven</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <Text variant="body2" className="mb-2">
          Minimum Operators
        </Text>
        <Input
          id="minOperators"
          type="number"
          min={1}
          value={form.minOperators.toString()}
          onChange={(v) => updateForm('minOperators', Number(v))}
          isControlled
        />
      </div>

      <div>
        <Text variant="body2" className="mb-2">
          Maximum Operators (0 = unlimited)
        </Text>
        <Input
          id="maxOperators"
          type="number"
          min={0}
          value={form.maxOperators.toString()}
          onChange={(v) => updateForm('maxOperators', Number(v))}
          isControlled
        />
      </div>
    </div>

    {form.pricing === 'Subscription' && (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Text variant="body2" className="mb-2">
            Subscription Rate (wei)
          </Text>
          <Input
            id="subscriptionRate"
            value={form.subscriptionRate}
            onChange={(v) => updateForm('subscriptionRate', v)}
            placeholder="0"
            isControlled
          />
        </div>

        <div>
          <Text variant="body2" className="mb-2">
            Subscription Interval (seconds)
          </Text>
          <Input
            id="subscriptionInterval"
            value={form.subscriptionInterval}
            onChange={(v) => updateForm('subscriptionInterval', v)}
            placeholder="2592000"
            isControlled
          />
        </div>
      </div>
    )}

    {form.pricing === 'EventDriven' && (
      <div>
        <Text variant="body2" className="mb-2">
          Event Rate (wei per job)
        </Text>
        <Input
          id="eventRate"
          value={form.eventRate}
          onChange={(v) => updateForm('eventRate', v)}
          placeholder="0"
          isControlled
        />
      </div>
    )}
  </div>
);

interface JobsStepProps {
  form: FormState;
  addJob: () => void;
  updateJob: (index: number, updates: Partial<JobForm>) => void;
  removeJob: (index: number) => void;
}

const JobsStep: FC<JobsStepProps> = ({
  form,
  addJob,
  updateJob,
  removeJob,
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between mb-4">
      <Text variant="h5" fw="bold">
        Job Definitions *
      </Text>
      <Button variant="secondary" size="sm" onClick={addJob}>
        Add Job
      </Button>
    </div>

    {form.jobs.length === 0 ? (
      <div className="text-center py-8 text-mono-100 dark:text-mono-60 border border-dashed border-mono-60 dark:border-mono-170 rounded-lg">
        <Text variant="body1">
          At least one job is required. Jobs define the operations operators can
          perform.
        </Text>
      </div>
    ) : (
      <div className="space-y-4">
        {form.jobs.map((job, index) => (
          <div
            key={index}
            className="p-4 border border-mono-60 dark:border-mono-170 rounded-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <Text variant="body1" fw="semibold">
                Job {index + 1}
              </Text>
              <Button
                variant="utility"
                size="sm"
                onClick={() => removeJob(index)}
              >
                Remove
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <Text variant="body3" className="mb-1">
                  Job Name
                </Text>
                <Input
                  id={`job-${index}-name`}
                  value={job.name}
                  onChange={(v) => updateJob(index, { name: v })}
                  placeholder="e.g., process_data"
                  isControlled
                />
              </div>

              <div>
                <Text variant="body3" className="mb-1">
                  Description
                </Text>
                <Input
                  id={`job-${index}-desc`}
                  value={job.description}
                  onChange={(v) => updateJob(index, { description: v })}
                  placeholder="What does this job do?"
                  isControlled
                />
              </div>

              <div>
                <Text variant="body3" className="mb-1">
                  Params Schema (JSON)
                </Text>
                <textarea
                  className="w-full min-h-28 p-3 rounded-lg border border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-190 font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                  value={job.paramsSchemaJson}
                  onChange={(e) =>
                    updateJob(index, { paramsSchemaJson: e.target.value })
                  }
                  placeholder='[{"kind":"String","name":"input"}]'
                />
              </div>

              <div>
                <Text variant="body3" className="mb-1">
                  Result Schema (JSON)
                </Text>
                <textarea
                  className="w-full min-h-28 p-3 rounded-lg border border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-190 font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                  value={job.resultSchemaJson}
                  onChange={(e) =>
                    updateJob(index, { resultSchemaJson: e.target.value })
                  }
                  placeholder='[{"kind":"String","name":"output"}]'
                />
              </div>

              <Text variant="body3" className="text-mono-100 dark:text-mono-60">
                Use an array of fields. Example:{' '}
                <InlineCode>{`[{"kind":"Uint256","name":"value"}]`}</InlineCode>
              </Text>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

interface SourcesStepProps {
  form: FormState;
  updateForm: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  addSource: () => void;
  updateSource: (index: number, updates: Partial<SourceForm>) => void;
  removeSource: (index: number) => void;
}

const SourcesStep: FC<SourcesStepProps> = ({
  form,
  addSource,
  updateSource,
  removeSource,
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between mb-4">
      <Text variant="h5" fw="bold">
        Execution Sources
      </Text>
      <Button variant="secondary" size="sm" onClick={addSource}>
        Add Source
      </Button>
    </div>

    {form.sources.length === 0 ? (
      <div className="text-center py-8 text-mono-100 dark:text-mono-60 border border-dashed border-mono-60 dark:border-mono-170 rounded-lg">
        <Text variant="body1">
          Add at least one execution source (Container, Wasm, or Native).
        </Text>
      </div>
    ) : (
      <div className="space-y-4">
        {form.sources.map((source, index) => (
          <div
            key={index}
            className="p-4 border border-mono-60 dark:border-mono-170 rounded-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <Text variant="body1" fw="semibold">
                Source {index + 1}
              </Text>
              <Button
                variant="utility"
                size="sm"
                onClick={() => removeSource(index)}
              >
                Remove
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <Text variant="body3" className="mb-1">
                  Type
                </Text>
                <Select
                  value={source.kind}
                  onValueChange={(v: string) =>
                    updateSource(index, {
                      kind: v as 'Container' | 'Wasm' | 'Native',
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Container">
                      Container (Docker)
                    </SelectItem>
                    <SelectItem value="Wasm">WebAssembly</SelectItem>
                    <SelectItem value="Native">Native Binary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {source.kind === 'Container' && (
                <>
                  <div>
                    <Text variant="body3" className="mb-1">
                      Registry
                    </Text>
                    <Input
                      id={`source-${index}-registry`}
                      value={source.registry || ''}
                      onChange={(v) => updateSource(index, { registry: v })}
                      placeholder="docker.io"
                      isControlled
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Text variant="body3" className="mb-1">
                        Image
                      </Text>
                      <Input
                        id={`source-${index}-image`}
                        value={source.image || ''}
                        onChange={(v) => updateSource(index, { image: v })}
                        placeholder="my-blueprint"
                        isControlled
                      />
                    </div>
                    <div>
                      <Text variant="body3" className="mb-1">
                        Tag
                      </Text>
                      <Input
                        id={`source-${index}-tag`}
                        value={source.tag || ''}
                        onChange={(v) => updateSource(index, { tag: v })}
                        placeholder="latest"
                        isControlled
                      />
                    </div>
                  </div>
                </>
              )}

              {(source.kind === 'Wasm' || source.kind === 'Native') && (
                <>
                  <div>
                    <Text variant="body3" className="mb-1">
                      Artifact URI
                    </Text>
                    <Input
                      id={`source-${index}-uri`}
                      value={source.artifactUri || ''}
                      onChange={(v) => updateSource(index, { artifactUri: v })}
                      placeholder="ipfs://... or https://..."
                      isControlled
                    />
                  </div>
                  <div>
                    <Text variant="body3" className="mb-1">
                      Entrypoint
                    </Text>
                    <Input
                      id={`source-${index}-entry`}
                      value={source.entrypoint || ''}
                      onChange={(v) => updateSource(index, { entrypoint: v })}
                      placeholder="main"
                      isControlled
                    />
                  </div>
                </>
              )}

              {/* Binaries Section - Required */}
              <div className="mt-4 pt-4 border-t border-mono-60 dark:border-mono-170">
                <div className="flex items-center justify-between mb-3">
                  <Text variant="body2" fw="semibold">
                    Binaries *
                  </Text>
                  <Button
                    variant="utility"
                    size="sm"
                    onClick={() =>
                      updateSource(index, {
                        binaries: [
                          ...source.binaries,
                          { arch: 5, os: 1, name: '', sha256: '' },
                        ],
                      })
                    }
                  >
                    Add Binary
                  </Button>
                </div>

                {source.binaries.length === 0 ? (
                  <Text
                    variant="body3"
                    className="text-mono-100 dark:text-mono-60 text-center py-2"
                  >
                    At least one binary is required per source.
                  </Text>
                ) : (
                  <div className="space-y-3">
                    {source.binaries.map((binary, binIndex) => (
                      <div
                        key={binIndex}
                        className="p-3 bg-mono-20 dark:bg-mono-190/50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Text variant="body3" fw="semibold">
                            Binary {binIndex + 1}
                          </Text>
                          <Button
                            variant="utility"
                            size="sm"
                            onClick={() =>
                              updateSource(index, {
                                binaries: source.binaries.filter(
                                  (_, i) => i !== binIndex,
                                ),
                              })
                            }
                          >
                            Remove
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <Text variant="body3" className="mb-1">
                              Architecture
                            </Text>
                            <Select
                              value={String(binary.arch)}
                              onValueChange={(v: string) =>
                                updateSource(index, {
                                  binaries: source.binaries.map((b, i) =>
                                    i === binIndex
                                      ? { ...b, arch: Number(v) }
                                      : b,
                                  ),
                                })
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">Wasm32</SelectItem>
                                <SelectItem value="1">Wasm64</SelectItem>
                                <SelectItem value="2">Wasi32</SelectItem>
                                <SelectItem value="3">Wasi64</SelectItem>
                                <SelectItem value="4">Amd32</SelectItem>
                                <SelectItem value="5">Amd64</SelectItem>
                                <SelectItem value="6">Arm32</SelectItem>
                                <SelectItem value="7">Arm64</SelectItem>
                                <SelectItem value="8">RiscV32</SelectItem>
                                <SelectItem value="9">RiscV64</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Text variant="body3" className="mb-1">
                              Operating System
                            </Text>
                            <Select
                              value={String(binary.os)}
                              onValueChange={(v: string) =>
                                updateSource(index, {
                                  binaries: source.binaries.map((b, i) =>
                                    i === binIndex
                                      ? { ...b, os: Number(v) }
                                      : b,
                                  ),
                                })
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">Unknown</SelectItem>
                                <SelectItem value="1">Linux</SelectItem>
                                <SelectItem value="2">Windows</SelectItem>
                                <SelectItem value="3">MacOS</SelectItem>
                                <SelectItem value="4">BSD</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="mb-2">
                          <Text variant="body3" className="mb-1">
                            Name
                          </Text>
                          <Input
                            id={`source-${index}-binary-${binIndex}-name`}
                            value={binary.name}
                            onChange={(v) =>
                              updateSource(index, {
                                binaries: source.binaries.map((b, i) =>
                                  i === binIndex ? { ...b, name: v } : b,
                                ),
                              })
                            }
                            placeholder="my-binary"
                            isControlled
                          />
                        </div>

                        <div>
                          <Text variant="body3" className="mb-1">
                            SHA256 Hash *
                          </Text>
                          <Input
                            id={`source-${index}-binary-${binIndex}-sha256`}
                            value={binary.sha256}
                            onChange={(v) =>
                              updateSource(index, {
                                binaries: source.binaries.map((b, i) =>
                                  i === binIndex ? { ...b, sha256: v } : b,
                                ),
                              })
                            }
                            placeholder="0x + 64 hex characters"
                            isControlled
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const ReviewStep: FC<{
  form: FormState;
  metadataPreview: string;
  onCopyMetadataPreview: () => void | Promise<void>;
}> = ({ form, metadataPreview, onCopyMetadataPreview }) => (
  <div className="space-y-4">
    <Text variant="h5" fw="bold" className="mb-4">
      Review Blueprint
    </Text>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <Text variant="body2" className="text-mono-100 dark:text-mono-60">
          Name
        </Text>
        <Text variant="body1" fw="semibold">
          {form.name || '-'}
        </Text>
      </div>

      <div>
        <Text variant="body2" className="text-mono-100 dark:text-mono-60">
          Author
        </Text>
        <Text variant="body1">{form.author || 'Your address'}</Text>
      </div>

      <div>
        <Text variant="body2" className="text-mono-100 dark:text-mono-60">
          Category
        </Text>
        <Text variant="body1">{form.category || '-'}</Text>
      </div>

      <div>
        <Text variant="body2" className="text-mono-100 dark:text-mono-60">
          License
        </Text>
        <Text variant="body1">{form.license || '-'}</Text>
      </div>

      <div>
        <Text variant="body2" className="text-mono-100 dark:text-mono-60">
          Membership
        </Text>
        <Text variant="body1">{form.membership}</Text>
      </div>

      <div>
        <Text variant="body2" className="text-mono-100 dark:text-mono-60">
          Pricing
        </Text>
        <Text variant="body1">{form.pricing}</Text>
      </div>

      <div>
        <Text variant="body2" className="text-mono-100 dark:text-mono-60">
          Operators
        </Text>
        <Text variant="body1">
          {form.minOperators} -{' '}
          {form.maxOperators === 0 ? '∞' : form.maxOperators}
        </Text>
      </div>

      <div>
        <Text variant="body2" className="text-mono-100 dark:text-mono-60">
          Jobs / Sources
        </Text>
        <Text variant="body1">
          {form.jobs.length} jobs, {form.sources.length} sources
        </Text>
      </div>
    </div>

    {form.description && (
      <div>
        <Text variant="body2" className="text-mono-100 dark:text-mono-60">
          Description
        </Text>
        <Text variant="body1">{form.description}</Text>
      </div>
    )}

    <div className="rounded-xl border border-mono-60 dark:border-mono-170 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Text variant="body2" className="text-mono-100 dark:text-mono-60">
            Metadata payload to publish at {form.metadataUri || 'metadata URI'}
          </Text>
          <Text
            variant="body3"
            className="text-mono-100 dark:text-mono-60 mt-1"
          >
            This is the exact `blueprintUi` contract the shared host will parse.
            Advanced tier-2 sections can be added directly to the JSON after
            copying it out.
          </Text>
        </div>
        <Button variant="secondary" size="sm" onClick={onCopyMetadataPreview}>
          Copy JSON
        </Button>
      </div>
      <textarea
        className="w-full min-h-64 p-3 rounded-lg border border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-190 font-mono text-sm resize-y focus:outline-none"
        value={metadataPreview}
        readOnly
      />
    </div>
  </div>
);

export default CreateBlueprintPage;
