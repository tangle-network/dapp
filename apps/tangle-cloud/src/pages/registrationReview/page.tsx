import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { useActiveChain } from '@tangle-network/api-provider-environment/hooks/useActiveChain';
import { ThreeDotsVerticalIcon } from '@tangle-network/icons/ThreeDotsVerticalIcon';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import IconButton from '@tangle-network/ui-components/components/buttons/IconButton';
import {
  Dropdown,
  DropdownBody,
  DropdownMenuItem,
} from '@tangle-network/ui-components/components/Dropdown';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { Children, useCallback, useEffect, useMemo, useState } from 'react';
import ParamsForm from './RegistrationForm/ParamsForm';
import { SessionStorageKey } from '../../constants';
import { useNavigate } from 'react-router';
import { PagePath } from '../../types';
import useServicesRegisterTx from '../../data/services/useServicesRegisterTx';
import { toTanglePrimitiveEcdsaKey } from '../../utils';
import useSubstrateAddress from '@tangle-network/tangle-shared-ui/hooks/useSubstrateAddress';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import { toPrimitiveArgsDataType } from '../../utils/toPrimitiveArgsDataType';

export default function RegistrationReview() {
  const navigate = useNavigate();

  const { rpcUrl, blueprints } = useMemo(() => {
    const data = JSON.parse(
      sessionStorage.getItem(SessionStorageKey.BLUEPRINT_REGISTRATION_PARAMS) ||
        '{}',
    );
    if (data && 'rpcUrl' in data && 'selectedBlueprints' in data) {
      return {
        rpcUrl: data.rpcUrl,
        blueprints: data.selectedBlueprints as Blueprint[],
      };
    }
    return { rpcUrl: null, blueprints: [] };
  }, []);

  const [amount, setAmount] = useState<Record<string, any>>({});

  const { network } = useNetworkStore();

  const { execute: registerTx, status: registerTxStatus } =
    useServicesRegisterTx();

  const [registrationParams, setRegistrationParams] = useState<
    Record<string, any>
  >({});

  const activeAccount = useSubstrateAddress();
  const [activeChain] = useActiveChain();

  const isValidParams = useMemo(() => {
    return blueprints.every((blueprint) => {
      const params = registrationParams[blueprint.id.toString()];

      if (!params) {
        return false;
      }

      return Object.keys(params).length === blueprint.registrationParams.length;
    });
  }, [blueprints, registrationParams]);

  const isValidAmount = useMemo(() => {
    const amountValues = Object.values(amount);
    return (
      amountValues.every((amount) => Number(amount) > 0) &&
      amountValues.length === blueprints.length
    );
  }, [amount, blueprints]);

  useEffect(() => {
    if (registerTxStatus === TxStatus.COMPLETE) {
      sessionStorage.removeItem(
        SessionStorageKey.BLUEPRINT_REGISTRATION_PARAMS,
      );
      navigate(PagePath.BLUEPRINTS);
    }
  }, [registerTxStatus, navigate]);

  const onClose = () => {
    sessionStorage.removeItem(SessionStorageKey.BLUEPRINT_REGISTRATION_PARAMS);
    navigate(PagePath.BLUEPRINTS);
  };

  const handleRegister = useCallback(async () => {
    if (!activeAccount || !registerTx) {
      return;
    }

    const preferences = blueprints.map(() => {
      return {
        key: toTanglePrimitiveEcdsaKey(activeAccount),
        // Include RPC URL in preferences if provided
        ...(rpcUrl ? { rpcUrl } : {}),
      };
    }) as any;

    registerTx({
      blueprintIds: blueprints.map((blueprint) => blueprint.id.toString()),
      preferences,
      registrationArgs: blueprints.map(
        ({
          id: blueprintId,
          registrationParams: blueprintRegistrationParams,
        }) => {
          const paramValues = registrationParams[blueprintId.toString()];
          return toPrimitiveArgsDataType(
            blueprintRegistrationParams,
            paramValues,
          );
        },
      ),
      amounts: blueprints.map(({ id }) => amount[id.toString()]),
    });
  }, [
    activeAccount,
    rpcUrl,
    registerTx,
    blueprints,
    registrationParams,
    amount,
  ]);

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
        {Children.toArray(
          blueprints.map((blueprint) => (
            <div className="p-6 border-2 border-mono-80 dark:border-mono-160">
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
                      <IconButton onClick={(event) => event.stopPropagation()}>
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

              <ParamsForm
                params={blueprint.registrationParams}
                tokenSymbol={network.tokenSymbol}
                amountValue={amount[blueprint.id.toString()] ?? ''}
                paramsValue={registrationParams[blueprint.id.toString()] ?? {}}
                onSave={(params, amount) => {
                  setRegistrationParams((prev) => ({
                    ...prev,
                    [blueprint.id.toString()]: params,
                  }));
                  setAmount((prev) => ({
                    ...prev,
                    [blueprint.id.toString()]: amount,
                  }));
                }}
              />
            </div>
          )),
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Button isFullWidth variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button
            isFullWidth
            isDisabled={
              !isValidParams ||
              !isValidAmount ||
              !activeChain ||
              registerTxStatus === TxStatus.PROCESSING
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
