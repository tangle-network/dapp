import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { z } from 'zod';

export enum RegistrationStep {
  SELECT_BLUEPRINTS = 1,
  CONFIGURE = 2,
  REVIEW = 3,
}

export const STEP_LABELS: Record<RegistrationStep, string> = {
  [RegistrationStep.SELECT_BLUEPRINTS]: 'Select Blueprints',
  [RegistrationStep.CONFIGURE]: 'Configure',
  [RegistrationStep.REVIEW]: 'Review',
};

export const TOTAL_STEPS = 3;

export const blueprintConfigSchema = z.object({
  params: z.record(z.string(), z.any()),
});

export const registrationFormSchema = z.object({
  rpcUrl: z
    .string()
    .min(1, 'RPC URL is required')
    .url({ message: 'Please enter a valid URL' }),
  blueprintConfigs: z.record(z.string(), blueprintConfigSchema),
});

export type BlueprintConfig = z.infer<typeof blueprintConfigSchema>;
export type RegistrationFormSchema = z.infer<typeof registrationFormSchema>;

export type RegistrationDrawerProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  blueprints: Blueprint[];
  onRemoveBlueprint?: (blueprintId: string) => void;
  onRegistrationComplete?: () => void;
};
