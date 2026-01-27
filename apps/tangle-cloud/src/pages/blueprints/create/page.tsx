/**
 * Blueprint creation wizard - multi-step form for creating new blueprints.
 */

import { FC, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAccount } from 'wagmi';
import {
  Button,
  Card,
  CardVariant,
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
import { ArrowLeft, CheckboxCircleFill } from '@tangle-network/icons';
import {
  useCreateBlueprintTx,
  type BlueprintDefinition,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import ErrorMessage from '../../../components/ErrorMessage';
import { PagePath } from '../../../types';
import { zeroAddress, type Address, toHex } from 'viem';

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
}

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

  // Convert jobs
  const jobs = form.jobs.map((job) => ({
    name: job.name,
    description: job.description,
    metadataUri: '',
    paramsSchema: '0x' as `0x${string}`,
    resultSchema: '0x' as `0x${string}`,
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

const CreateBlueprintPage: FC = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { createBlueprint, status, error, reset } = useCreateBlueprintTx();

  const [step, setStep] = useState<Step>(Step.BasicInfo);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [validationError, setValidationError] = useState<string | null>(null);

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
          if (!form.jobs[i].name.trim()) {
            setValidationError(`Job ${i + 1} name is required`);
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

    const definition = formToDefinition(form, address);
    await createBlueprint(definition);
  }, [form, address, createBlueprint, validateStep]);

  // Add job helper
  const addJob = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      jobs: [...prev.jobs, { name: '', description: '' }],
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
      <div className="text-center py-12">
        <Typography variant="h4">Connect Wallet</Typography>
        <Typography variant="body1" className="text-mono-100 mt-2">
          Please connect your wallet to create a blueprint.
        </Typography>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <CheckboxCircleFill className="w-16 h-16 text-green-500 mb-4" />
        <Typography variant="h4" className="text-center">
          Blueprint Created!
        </Typography>
        <Typography variant="body1" className="text-mono-100 mt-2 mb-6 text-center">
          Your blueprint has been created successfully.
        </Typography>
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
          <Typography variant="h4" fw="bold">
            Create Blueprint
          </Typography>
          <Typography variant="body2" className="text-mono-100">
            Define a new blueprint for operators to register with.
          </Typography>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {STEP_LABELS.map((label, index) => (
          <div key={label} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                index === step
                  ? 'bg-purple-500 text-white'
                  : index < step
                    ? 'bg-green-500 text-white'
                    : 'bg-mono-60 dark:bg-mono-140 text-mono-100'
              }`}
            >
              {index < step ? '✓' : index + 1}
            </div>
            <Typography
              variant="body2"
              className={`ml-2 ${index === step ? 'text-mono-200 dark:text-mono-0' : 'text-mono-100'}`}
            >
              {label}
            </Typography>
            {index < STEP_LABELS.length - 1 && (
              <div className="w-8 h-px bg-mono-60 dark:bg-mono-140 mx-4" />
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <Card variant={CardVariant.GLASS} className="p-6">
        {step === Step.BasicInfo && (
          <BasicInfoStep form={form} updateForm={updateForm} />
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
        {step === Step.Review && <ReviewStep form={form} />}

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

const BasicInfoStep: FC<StepProps> = ({ form, updateForm }) => (
  <div className="space-y-4">
    <Typography variant="h5" fw="bold" className="mb-4">
      Basic Information
    </Typography>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <Typography variant="body2" className="mb-2">
          Blueprint Name *
        </Typography>
        <Input
          id="name"
          value={form.name}
          onChange={(v) => updateForm('name', v)}
          placeholder="Enter blueprint name"
          isControlled
        />
      </div>

      <div>
        <Typography variant="body2" className="mb-2">
          Author
        </Typography>
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
      <Typography variant="body2" className="mb-2">
        Description
      </Typography>
      <textarea
        className="w-full h-24 p-3 rounded-lg border border-mono-60 dark:border-mono-140 bg-mono-0 dark:bg-mono-180 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Describe what your blueprint does"
        value={form.description}
        onChange={(e) => updateForm('description', e.target.value)}
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <Typography variant="body2" className="mb-2">
          Category
        </Typography>
        <Input
          id="category"
          value={form.category}
          onChange={(v) => updateForm('category', v)}
          placeholder="e.g., DeFi, Oracle, Compute"
          isControlled
        />
      </div>

      <div>
        <Typography variant="body2" className="mb-2">
          License
        </Typography>
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
        <Typography variant="body2" className="mb-2">
          Code Repository
        </Typography>
        <Input
          id="codeRepository"
          value={form.codeRepository}
          onChange={(v) => updateForm('codeRepository', v)}
          placeholder="https://github.com/..."
          isControlled
        />
      </div>

      <div>
        <Typography variant="body2" className="mb-2">
          Website
        </Typography>
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
      <Typography variant="body2" className="mb-2">
        Logo URL
      </Typography>
      <Input
        id="logo"
        value={form.logo}
        onChange={(v) => updateForm('logo', v)}
        placeholder="https://... or ipfs://..."
        isControlled
      />
    </div>

    <div>
      <Typography variant="body2" className="mb-2">
        Metadata URI *
      </Typography>
      <Input
        id="metadataUri"
        value={form.metadataUri}
        onChange={(v) => updateForm('metadataUri', v)}
        placeholder="ipfs://... or https://..."
        isControlled
      />
      <Typography variant="body3" className="text-mono-100 mt-1">
        Link to blueprint metadata JSON (must be accessible)
      </Typography>
    </div>

    <div>
      <Typography variant="body2" className="mb-2">
        Service Manager Contract (optional)
      </Typography>
      <Input
        id="manager"
        value={form.manager}
        onChange={(v) => updateForm('manager', v)}
        placeholder="0x... (leave empty for none)"
        isControlled
      />
    </div>
  </div>
);

const ConfigurationStep: FC<StepProps> = ({ form, updateForm }) => (
  <div className="space-y-4">
    <Typography variant="h5" fw="bold" className="mb-4">
      Blueprint Configuration
    </Typography>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <Typography variant="body2" className="mb-2">
          Membership Model
        </Typography>
        <Select
          value={form.membership}
          onValueChange={(v) =>
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
        <Typography variant="body2" className="mb-2">
          Pricing Model
        </Typography>
        <Select
          value={form.pricing}
          onValueChange={(v) =>
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
        <Typography variant="body2" className="mb-2">
          Minimum Operators
        </Typography>
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
        <Typography variant="body2" className="mb-2">
          Maximum Operators (0 = unlimited)
        </Typography>
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
          <Typography variant="body2" className="mb-2">
            Subscription Rate (wei)
          </Typography>
          <Input
            id="subscriptionRate"
            value={form.subscriptionRate}
            onChange={(v) => updateForm('subscriptionRate', v)}
            placeholder="0"
            isControlled
          />
        </div>

        <div>
          <Typography variant="body2" className="mb-2">
            Subscription Interval (seconds)
          </Typography>
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
        <Typography variant="body2" className="mb-2">
          Event Rate (wei per job)
        </Typography>
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
      <Typography variant="h5" fw="bold">
        Job Definitions *
      </Typography>
      <Button variant="secondary" size="sm" onClick={addJob}>
        Add Job
      </Button>
    </div>

    {form.jobs.length === 0 ? (
      <div className="text-center py-8 text-mono-100 border border-dashed border-mono-60 dark:border-mono-140 rounded-lg">
        <Typography variant="body1">
          At least one job is required. Jobs define the operations operators can
          perform.
        </Typography>
      </div>
    ) : (
      <div className="space-y-4">
        {form.jobs.map((job, index) => (
          <div
            key={index}
            className="p-4 border border-mono-60 dark:border-mono-140 rounded-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <Typography variant="body1" fw="semibold">
                Job {index + 1}
              </Typography>
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
                <Typography variant="body3" className="mb-1">
                  Job Name
                </Typography>
                <Input
                  id={`job-${index}-name`}
                  value={job.name}
                  onChange={(v) => updateJob(index, { name: v })}
                  placeholder="e.g., process_data"
                  isControlled
                />
              </div>

              <div>
                <Typography variant="body3" className="mb-1">
                  Description
                </Typography>
                <Input
                  id={`job-${index}-desc`}
                  value={job.description}
                  onChange={(v) => updateJob(index, { description: v })}
                  placeholder="What does this job do?"
                  isControlled
                />
              </div>
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
      <Typography variant="h5" fw="bold">
        Execution Sources
      </Typography>
      <Button variant="secondary" size="sm" onClick={addSource}>
        Add Source
      </Button>
    </div>

    {form.sources.length === 0 ? (
      <div className="text-center py-8 text-mono-100 border border-dashed border-mono-60 dark:border-mono-140 rounded-lg">
        <Typography variant="body1">
          Add at least one execution source (Container, Wasm, or Native).
        </Typography>
      </div>
    ) : (
      <div className="space-y-4">
        {form.sources.map((source, index) => (
          <div
            key={index}
            className="p-4 border border-mono-60 dark:border-mono-140 rounded-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <Typography variant="body1" fw="semibold">
                Source {index + 1}
              </Typography>
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
                <Typography variant="body3" className="mb-1">
                  Type
                </Typography>
                <Select
                  value={source.kind}
                  onValueChange={(v) =>
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
                    <Typography variant="body3" className="mb-1">
                      Registry
                    </Typography>
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
                      <Typography variant="body3" className="mb-1">
                        Image
                      </Typography>
                      <Input
                        id={`source-${index}-image`}
                        value={source.image || ''}
                        onChange={(v) => updateSource(index, { image: v })}
                        placeholder="my-blueprint"
                        isControlled
                      />
                    </div>
                    <div>
                      <Typography variant="body3" className="mb-1">
                        Tag
                      </Typography>
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
                    <Typography variant="body3" className="mb-1">
                      Artifact URI
                    </Typography>
                    <Input
                      id={`source-${index}-uri`}
                      value={source.artifactUri || ''}
                      onChange={(v) => updateSource(index, { artifactUri: v })}
                      placeholder="ipfs://... or https://..."
                      isControlled
                    />
                  </div>
                  <div>
                    <Typography variant="body3" className="mb-1">
                      Entrypoint
                    </Typography>
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
              <div className="mt-4 pt-4 border-t border-mono-60 dark:border-mono-140">
                <div className="flex items-center justify-between mb-3">
                  <Typography variant="body2" fw="semibold">
                    Binaries *
                  </Typography>
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
                  <Typography
                    variant="body3"
                    className="text-mono-100 text-center py-2"
                  >
                    At least one binary is required per source.
                  </Typography>
                ) : (
                  <div className="space-y-3">
                    {source.binaries.map((binary, binIndex) => (
                      <div
                        key={binIndex}
                        className="p-3 bg-mono-20 dark:bg-mono-160 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Typography variant="body3" fw="semibold">
                            Binary {binIndex + 1}
                          </Typography>
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
                            <Typography variant="body3" className="mb-1">
                              Architecture
                            </Typography>
                            <Select
                              value={String(binary.arch)}
                              onValueChange={(v) =>
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
                            <Typography variant="body3" className="mb-1">
                              Operating System
                            </Typography>
                            <Select
                              value={String(binary.os)}
                              onValueChange={(v) =>
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
                          <Typography variant="body3" className="mb-1">
                            Name
                          </Typography>
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
                          <Typography variant="body3" className="mb-1">
                            SHA256 Hash *
                          </Typography>
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

const ReviewStep: FC<{ form: FormState }> = ({ form }) => (
  <div className="space-y-4">
    <Typography variant="h5" fw="bold" className="mb-4">
      Review Blueprint
    </Typography>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <Typography variant="body2" className="text-mono-100">
          Name
        </Typography>
        <Typography variant="body1" fw="semibold">
          {form.name || '-'}
        </Typography>
      </div>

      <div>
        <Typography variant="body2" className="text-mono-100">
          Author
        </Typography>
        <Typography variant="body1">{form.author || 'Your address'}</Typography>
      </div>

      <div>
        <Typography variant="body2" className="text-mono-100">
          Category
        </Typography>
        <Typography variant="body1">{form.category || '-'}</Typography>
      </div>

      <div>
        <Typography variant="body2" className="text-mono-100">
          License
        </Typography>
        <Typography variant="body1">{form.license || '-'}</Typography>
      </div>

      <div>
        <Typography variant="body2" className="text-mono-100">
          Membership
        </Typography>
        <Typography variant="body1">{form.membership}</Typography>
      </div>

      <div>
        <Typography variant="body2" className="text-mono-100">
          Pricing
        </Typography>
        <Typography variant="body1">{form.pricing}</Typography>
      </div>

      <div>
        <Typography variant="body2" className="text-mono-100">
          Operators
        </Typography>
        <Typography variant="body1">
          {form.minOperators} -{' '}
          {form.maxOperators === 0 ? '∞' : form.maxOperators}
        </Typography>
      </div>

      <div>
        <Typography variant="body2" className="text-mono-100">
          Jobs / Sources
        </Typography>
        <Typography variant="body1">
          {form.jobs.length} jobs, {form.sources.length} sources
        </Typography>
      </div>
    </div>

    {form.description && (
      <div>
        <Typography variant="body2" className="text-mono-100">
          Description
        </Typography>
        <Typography variant="body1">{form.description}</Typography>
      </div>
    )}
  </div>
);

export default CreateBlueprintPage;
