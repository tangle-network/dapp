import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { TxEvent } from '@tangle-network/abstract-api-provider';
import { useActiveChain } from '@tangle-network/api-provider-environment/hooks/useActiveChain';
import { Spinner } from '@tangle-network/icons';
import { ThreeDotsVerticalIcon } from '@tangle-network/icons/ThreeDotsVerticalIcon';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { useUIContext } from '@tangle-network/ui-components';
import {
  Accordion,
  AccordionButtonBase,
  AccordionContent,
  AccordionItem,
} from '@tangle-network/ui-components/components/Accordion';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import IconButton from '@tangle-network/ui-components/components/buttons/IconButton';
import {
  Dropdown,
  DropdownBody,
  DropdownMenuItem,
} from '@tangle-network/ui-components/components/Dropdown';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { useCallback, useMemo, useState } from 'react';
import { PricingFormResult, PricingType } from '../blueprints/PricingModal/types';
import ParamsForm from './RegistrationForm/ParamsForm';
import { SessionStorageKey } from '../../constants';
import { useNavigate } from 'react-router';
import { PagePath } from '../../types';
import useServiceRegisterTx from '../../data/services/useServiceRegisterTx';
import { toTanglePrimitiveEcdsaKey } from '../../utils';
import useSubstrateAddress from '@tangle-network/tangle-shared-ui/hooks/useSubstrateAddress';

export default function RegistrationReview() {
  const navigate = useNavigate();

  const { pricingSettings, blueprints } = useMemo(() => {
    const { pricingSettings, selectedBlueprints } = JSON.parse(sessionStorage.getItem(SessionStorageKey.BLUEPRINT_REGISTRATION_PARAMS) || '{}') as { pricingSettings: PricingFormResult, selectedBlueprints: Blueprint[] };
    return { pricingSettings, blueprints: selectedBlueprints };
  }, [sessionStorage]);

  const [amount, setAmount] = useState<Record<string, any>>({});

  const { network } = useNetworkStore();

  const { notificationApi } = useUIContext();

  // const { register } = useServicesTransactions();

  const { execute: registerTx, status: registerTxStatus } = useServiceRegisterTx();

  const [accordionState, setAccordionState] = useState<string>('');
  const [registrationParams, setRegistrationParams] = useState<
    Record<string, any>
  >({});

  const activeAccount = useSubstrateAddress();
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
    const amountValues = Object.values(amount);
    return amountValues.every((amount) => Number(amount) > 0) && amountValues.length === blueprints.length;
  }, [amount, blueprints]);

  const createNotificationHandler = useCallback(
    (prefix: string) => {
      return {
        onTxSending: () => {
          notificationApi.addToQueue({
            key: `${prefix}-${TxEvent.SENDING}`,
            Icon: <Spinner />,
            message: `Sending ${prefix.toLowerCase()} transaction`,
            variant: 'info',
          });
        },
        onTxSuccess: () => {
          notificationApi.remove(`${prefix}-${TxEvent.SENDING}`);
          notificationApi.addToQueue({
            key: `${prefix}-${TxEvent.SUCCESS}`,
            message: `${prefix} transaction sent successfully!`,
            variant: 'success',
          });
        },
        onTxFailed: (errorMessage: string) => {
          notificationApi.remove(`${prefix}-${TxEvent.SENDING}`);
          notificationApi.addToQueue({
            key: `${prefix}-${TxEvent.FAILED}`,
            message: `${prefix} transaction failed!`,
            secondaryMessage: `Error: ${errorMessage}`,
            variant: 'error',
          });
        },
      };
    },
    [notificationApi],
  );

  const onClose = () => {
    sessionStorage.removeItem(SessionStorageKey.BLUEPRINT_REGISTRATION_PARAMS);
    navigate(PagePath.BLUEPRINTS);
  };

  console.log('registerTxStatus', registerTxStatus);  

  const handleRegister = useCallback(async () => {
    if (!activeAccount || !pricingSettings || !registerTx) {
      return;
    }
    console.log("empty");
    

    const preferences = blueprints.map(({ id }) => {
      const blueprintPriceSettings =
        pricingSettings.type === PricingType.GLOBAL
          ? pricingSettings.values
          : pricingSettings.values[id];

      return {
        key: toTanglePrimitiveEcdsaKey(activeAccount),
        priceTargets: {
          cpu: Number(blueprintPriceSettings.cpuPrice),
          mem: Number(blueprintPriceSettings.memPrice),
          storageHdd: Number(blueprintPriceSettings.hddStoragePrice),
          storageSsd: Number(blueprintPriceSettings.ssdStoragePrice),
          storageNvme: Number(blueprintPriceSettings.nvmeStoragePrice),
        },
      };
    }) as any;

    registerTx({
      blueprintIds: blueprints.map((blueprint) => blueprint.id),
      preferences,
      registrationArgs: blueprints.map(({ id }) => registrationParams[id]),
      amounts: blueprints.map(({ id }) => amount[id]),
    });

    // await register(
    //   {
    //     blueprintIds: blueprints.map((blueprint) => blueprint.id),
    //     preferences,
    //     registrationArgs: blueprints.map(({ id }) => registrationParams[id]),
    //     amounts: blueprints.map(({ id }) => amount[id]),
    //   },
    //   {
    //     onPreRegister: createNotificationHandler('PreRegister'),
    //     onRegister: createNotificationHandler('Register'),
    //   },
    // );
  }, [activeAccount, pricingSettings, registerTx]);

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
        <Accordion
          type="single"
          collapsible
          value={accordionState}
          onValueChange={setAccordionState}
        >
          {blueprints.map((blueprint) => (
            <AccordionItem
              className="p-6 border-2 border-mono-80 dark:border-mono-160"
              key={blueprint.id}
              value={blueprint.id}
            >
              <AccordionButtonBase asChild>
                <div className="flex w-full gap-1">
                  {blueprint.imgUrl && (
                    <img
                      src={blueprint.imgUrl}
                      width={48}
                      height={48}
                      alt={blueprint.name}
                      className="flex-shrink-0 bg-center rounded-full"
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
                  amount={amount[blueprint.id]}
                  tokenSymbol={network.tokenSymbol}
                  onSave={(params, amount) => {
                    setRegistrationParams((prev) => ({
                      ...prev,
                      [blueprint.id]: params,
                    }));
                    setAmount((prev) => ({
                      ...prev,
                      [blueprint.id]: amount,
                    }));
                    setAccordionState('');
                  }}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="grid gap-4 sm:grid-cols-2">
          <Button isFullWidth variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button
            isFullWidth
            isDisabled={
              !isValidParams ||
              !isValidAmount ||
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
