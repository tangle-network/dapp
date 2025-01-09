import { decodeAddress } from '@polkadot/util-crypto';
import { HexString } from '@polkadot/util/types';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { useActiveAccount } from '@webb-tools/api-provider-environment/hooks/useActiveAccount';
import { useActiveChain } from '@webb-tools/api-provider-environment/hooks/useActiveChain';
import { ThreeDotsVerticalIcon } from '@webb-tools/icons/ThreeDotsVerticalIcon';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import { Blueprint } from '@webb-tools/tangle-shared-ui/types/blueprint';
import { getApiPromise } from '@webb-tools/tangle-shared-ui/utils/polkadot/api';
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
import assert from 'assert';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { parseUnits } from 'viem';
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
    if (!isValidParams || !isValidAmount || !activeChain) {
      return;
    }

    if (!isValidAddress || !pricingSettings) {
      return;
    }

    // Assert is safe here because we have already validated the address
    // this is just for type assertion
    assert(activeAccount);

    try {
      const api = await getApiPromise(network.wsRpcEndpoint);

      await new Promise<HexString>((resolve, reject) => {
        api.tx.utility
          .batch(
            blueprints.map((blueprint) =>
              api.tx.services.preRegister(blueprint.id),
            ),
          )
          .signAndSend(activeAccount.address, (result) => {
            const status = result.status;
            const events = result.events.filter(
              ({ event: { section } }) => section === 'system',
            );

            if (status.isInBlock || status.isFinalized) {
              for (const event of events) {
                const {
                  event: { method },
                } = event;
                const dispatchError = result.dispatchError;

                if (dispatchError && method === 'ExtrinsicFailed') {
                  let message: string = dispatchError.type;

                  if (dispatchError.isModule) {
                    try {
                      const mod = dispatchError.asModule;
                      const error = dispatchError.registry.findMetaError(mod);

                      message = `${error.section}.${error.name}`;
                    } catch (error) {
                      console.error(error);
                      reject(message);
                    }
                  } else if (dispatchError.isToken) {
                    message = `${dispatchError.type}.${dispatchError.asToken.type}`;
                  }

                  reject(message);
                } else if (
                  method === 'ExtrinsicSuccess' &&
                  status.isFinalized
                ) {
                  // Resolve with the block hash
                  resolve(status.asFinalized.toHex());
                }
              }
            }
          });
      });

      await new Promise<HexString>((resolve, reject) => {
        api.tx.utility
          .batch(
            blueprints.map((blueprint) => {
              const priceTargets =
                pricingSettings.type === PricingType.GLOBAL
                  ? pricingSettings.values
                  : pricingSettings.values[blueprint.id];

              return api.tx.services.register(
                blueprint.id,
                {
                  key: decodeAddress(
                    activeAccount.address,
                    undefined,
                    network.ss58Prefix,
                  ),
                  priceTargets: {
                    cpu: priceTargets.cpuPrice,
                    mem: priceTargets.memPrice,
                    storageHdd: priceTargets.hddStoragePrice,
                    storageSsd: priceTargets.ssdStoragePrice,
                    storageNvme: priceTargets.nvmeStoragePrice,
                  },
                },
                registrationParams[blueprint.id],
                parseUnits(amount, activeChain?.nativeCurrency.decimals),
              );
            }),
          )
          .signAndSend(activeAccount.address, (result) => {
            const status = result.status;
            const events = result.events.filter(
              ({ event: { section } }) => section === 'system',
            );

            if (status.isInBlock || status.isFinalized) {
              for (const event of events) {
                const {
                  event: { method },
                } = event;
                const dispatchError = result.dispatchError;

                if (dispatchError && method === 'ExtrinsicFailed') {
                  let message: string = dispatchError.type;

                  if (dispatchError.isModule) {
                    try {
                      const mod = dispatchError.asModule;
                      const error = dispatchError.registry.findMetaError(mod);

                      message = `${error.section}.${error.name}`;
                    } catch (error) {
                      console.error(error);
                      reject(message);
                    }
                  } else if (dispatchError.isToken) {
                    message = `${dispatchError.type}.${dispatchError.asToken.type}`;
                  }

                  reject(message);
                } else if (
                  method === 'ExtrinsicSuccess' &&
                  status.isFinalized
                ) {
                  // Resolve with the block hash
                  resolve(status.asFinalized.toHex());
                }
              }
            }
          });
      });

      // TODO: Notify success
    } catch (error) {
      // TODO: Notify error
      console.error('Error registering blueprints', error);
    }
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
