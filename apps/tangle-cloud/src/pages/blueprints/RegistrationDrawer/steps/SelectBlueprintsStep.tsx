import { Close } from '@tangle-network/icons';
import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { Button, Text } from '../../../../components/sandbox/SandboxUi';
import { FC } from 'react';
import BlueprintCard from '../components/BlueprintCard';

type SelectBlueprintsStepProps = {
  blueprints: Blueprint[];
  onRemoveBlueprint?: (blueprintId: string) => void;
};

const SelectBlueprintsStep: FC<SelectBlueprintsStepProps> = ({
  blueprints,
  onRemoveBlueprint,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Text variant="h5" fw="bold" className="mb-2">
          Selected Blueprints
        </Text>

        <Text variant="body2" className="text-mono-120 dark:text-mono-100">
          You have selected {blueprints.length} blueprint
          {blueprints.length > 1 ? 's' : ''} to register as an operator. Review
          your selection and proceed to configure settings.
        </Text>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {blueprints.map((blueprint) => (
          <BlueprintCard
            key={blueprint.id.toString()}
            blueprint={blueprint}
            action={
              onRemoveBlueprint && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveBlueprint(blueprint.id.toString())}
                >
                  <Close size="md" />
                </Button>
              )
            }
          />
        ))}
      </div>

      <Text variant="body3" className="text-mono-120 dark:text-mono-100">
        In the next step, you will configure your RPC URL and any required
        registration parameters for each blueprint.
      </Text>
    </div>
  );
};

export default SelectBlueprintsStep;
