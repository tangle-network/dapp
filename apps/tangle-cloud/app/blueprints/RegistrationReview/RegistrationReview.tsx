import { decodeAddress } from '@polkadot/util-crypto';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { useActiveAccount } from '@webb-tools/api-provider-environment/hooks/useActiveAccount';
import { useActiveChain } from '@webb-tools/api-provider-environment/hooks/useActiveChain';
import { ThreeDotsVerticalIcon } from '@webb-tools/icons/ThreeDotsVerticalIcon';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import { Blueprint } from '@webb-tools/tangle-shared-ui/types/blueprint';
import { isSubstrateAddress } from '@webb-tools/webb-ui-components';
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
import { useMemo, useState } from 'react';
import useServicesTransactions from '../../../hooks/useServicesTransactions';
import { PricingFormResult, PricingType } from '../PricingModal/types';
import ParamsForm from './ParamsForm';

type Props = {
  selectedBlueprints: Blueprint[];
  pricingSettings: PricingFormResult | null;
  onClose: () => void;
};

export default function RegistrationReview({
  selectedBlueprints: blueprints,
  pricingSettings,
  onClose,
}: Props) {
  const [amount, setAmount] = useState('');

  const { network } = useNetworkStore();

  const { register } = useServicesTransactions();

  const [registrationParams, setRegistrationParams] = useState<
    Record<string, any>
  >({});

  const [activeAccount] = useActiveAccount();
  const [activeChain] = useActiveChain();

  const isValidParams = useMemo(() => {
    return blueprints.every((blueprint) => {
      const params = registrationParams[blueprint.id];
      if (!params) {
        return false;
      }

      return Object.keys(params).length === blueprint.registrationParams.length;
    });
  }, [blueprints, registrationParams]);

  const isValidAmount = useMemo(() => {
    if (!amount) {
      return false;
    }

    return Number(amount) > 0;
  }, [amount]);

  const isValidAddress = useMemo(() => {
    if (!activeAccount) {
      return false;
    }

    return isSubstrateAddress(activeAccount.address);
  }, [activeAccount]);

  const handleRegister = async () => {
    if (!activeAccount || !pricingSettings) {
      return;
    }

    await register({
      blueprintIds: blueprints.map((blueprint) => blueprint.id),
      preferences: blueprints.map(({ id }) => {
        const blueprintPriceSettings =
          pricingSettings.type === PricingType.GLOBAL
            ? pricingSettings.values
            : pricingSettings.values[id];

        return {
          key: decodeAddress(
            activeAccount.address,
            undefined,
            network.ss58Prefix,
          ),
          priceTargets: {
            cpu: Number(blueprintPriceSettings.cpuPrice),
            mem: Number(blueprintPriceSettings.memPrice),
            storageHdd: Number(blueprintPriceSettings.hddStoragePrice),
            storageSsd: Number(blueprintPriceSettings.ssdStoragePrice),
            storageNvme: Number(blueprintPriceSettings.nvmeStoragePrice),
          },
        };
      }),
      registrationArgs: blueprints.map(({ id }) => registrationParams[id]),
      amount: blueprints.map(({ id }) => amount),
    });
  };

  return (
    <div>
      <Typography variant="h5" fw="bold" className="mb-4">
        Review Blueprints
      </Typography>

      <Typography
        variant="body2"
        className="mb-6 text-mono-120 dark:text-mono-100"
      >
        By registering, deployers can request service instances from selected
        Blueprints.
      </Typography>

      <div className="space-y-4">
        <Accordion type="single" collapsible>
          {blueprints.map((blueprint) => (
            <AccordionItem
              className="p-6 border-2 border-mono-80 dark:border-mono-160"
              key={blueprint.id}
              value={blueprint.id}
            >
              <AccordionButtonBase asChild>
                <div className="flex w-full gap-1">
                  {blueprint.imgUrl && (
                    <Image
                      src={blueprint.imgUrl}
                      width={48}
                      height={48}
                      alt={blueprint.name}
                      className="flex-shrink-0 bg-center rounded-full"
                      fill={false}
                    />
                  )}

                  <div className="space-y-1 grow">
                    <Typography variant="body1" fw="bold">
                      {blueprint.name}
                    </Typography>

                    <Typography
                      variant="body3"
                      className="text-mono-120 dark:text-mono-100"
                    >
                      {blueprint.author}
                    </Typography>
                  </div>

                  <div className="flex items-center gap-2">
                    <Dropdown>
                      <DropdownMenuTrigger asChild>
                        <IconButton
                          onClick={(event) => event.stopPropagation()}
                        >
                          <ThreeDotsVerticalIcon />
                        </IconButton>
                      </DropdownMenuTrigger>

                      <DropdownBody size="sm">
                        <DropdownMenuItem
                          onClick={(event) => event.stopPropagation()}
                        >
                          Remove
                        </DropdownMenuItem>
                      </DropdownBody>
                    </Dropdown>
                  </div>
                </div>
              </AccordionButtonBase>

              <AccordionContent>
                <ParamsForm
                  params={blueprint.registrationParams}
                  onSave={(params) =>
                    setRegistrationParams((prev) => ({
                      ...prev,
                      [blueprint.id]: params,
                    }))
                  }
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="space-y-2">
          <Label>Enter the value of {network.tokenSymbol} to register</Label>

          <TextField.Root className="mt-4">
            <TextField.Input
              placeholder="0.00"
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </TextField.Root>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Button isFullWidth variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button
            isFullWidth
            isDisabled={
              !isValidParams ||
              !isValidAmount ||
              !isValidAddress ||
              !pricingSettings ||
              !activeChain
            }
            onClick={handleRegister}
          >
            Register
          </Button>
        </div>
      </div>
    </div>
  );
}
