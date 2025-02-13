import { decodeAddress } from '@polkadot/util-crypto';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { useActiveAccount } from '@webb-tools/api-provider-environment/hooks/useActiveAccount';
import { useActiveChain } from '@webb-tools/api-provider-environment/hooks/useActiveChain';
import { Spinner } from '@webb-tools/icons';
import { ThreeDotsVerticalIcon } from '@webb-tools/icons/ThreeDotsVerticalIcon';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import { Blueprint } from '@webb-tools/tangle-shared-ui/data/blueprints/types';
import { isSubstrateAddress, useWebbUI } from '@webb-tools/webb-ui-components';
import {
  Accordion,
  AccordionButtonBase,
  AccordionContent,
  AccordionItem,
} from '@webb-tools/webb-ui-components/components/Accordion';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import IconButton from '@webb-tools/webb-ui-components/components/buttons/IconButton';
import {
  Dropdown,
  DropdownBody,
  DropdownMenuItem,
} from '@webb-tools/webb-ui-components/components/Dropdown';
import { Label } from '@webb-tools/webb-ui-components/components/Label';
import { TextField } from '@webb-tools/webb-ui-components/components/TextField';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import Image from 'next/image';
import { useCallback, useMemo, useState } from 'react';
import useServicesTransactions from '../../hooks/useServicesTransactions';
import { PricingFormResult, PricingType } from '../PricingModal/types';
import ParamsForm from './ParamsForm';
import { TxEvent } from '@webb-tools/abstract-api-provider';
import { ArrowLeftIcon } from '@radix-ui/react-icons';

interface Props {
  selectedBlueprints: Blueprint[];
  pricingSettings: {
    type: PricingType;
    amount: number;
  } | null;
  onClose: () => void;
}

export default function RegistrationReview({
  selectedBlueprints,
  pricingSettings,
  onClose,
}: Props) {
  const { registerService } = useServicesTransactions();
  const [currentBlueprintIndex, setCurrentBlueprintIndex] = useState(0);
  const currentBlueprint = selectedBlueprints[currentBlueprintIndex];

  const handleSubmit = useCallback(
    async (params: Record<string, unknown>) => {
      await registerService({
        blueprintId: currentBlueprint.id,
        params,
      });

      if (currentBlueprintIndex < selectedBlueprints.length - 1) {
        setCurrentBlueprintIndex((prev) => prev + 1);
      } else {
        onClose();
      }
    },
    [
      currentBlueprint.id,
      currentBlueprintIndex,
      onClose,
      registerService,
      selectedBlueprints.length,
    ],
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="link" onClick={onClose} leftIcon={<ArrowLeftIcon />}>
          Back
        </Button>

        <Typography variant="h4" fw="bold">
          Register Blueprint
        </Typography>
      </div>

      <ParamsForm
        blueprint={currentBlueprint}
        pricingSettings={pricingSettings}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
