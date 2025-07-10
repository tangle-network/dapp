'use client';

import BlueprintHeader from '@tangle-network/tangle-shared-ui/components/blueprints/BlueprintHeader';
import OperatorsTable from '@tangle-network/tangle-shared-ui/components/tables/Operators';
import useBlueprintDetails from '@tangle-network/tangle-shared-ui/data/restake/useBlueprintDetails';
import { ErrorFallback } from '@tangle-network/ui-components/components/ErrorFallback';
import SkeletonLoader from '@tangle-network/ui-components/components/SkeletonLoader';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { type FC, type PropsWithChildren, useMemo, useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { PagePath, TangleDAppPagePath } from '../../../types';
import ConfigureBlueprintModal from '../ConfigureBlueprintModal';
import { Modal } from '@tangle-network/ui-components';
import type { BlueprintFormResult } from '../ConfigureBlueprintModal/types';

import { SessionStorageKey } from '../../../constants';
import useOperatorInfo from '@tangle-network/tangle-shared-ui/hooks/useOperatorInfo';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { toSubstrateAddress } from '@tangle-network/ui-components';
import useParamWithSchema from '@tangle-network/tangle-shared-ui/hooks/useParamWithSchema';
import { z } from 'zod';

const RestakeOperatorAction: FC<PropsWithChildren<{ address: string }>> = ({
  children,
  address,
}) => {
  return (
    <Link
      to={`${TangleDAppPagePath.RESTAKE_OPERATOR}/${address}`}
      target="_blank"
    >
      {children}
    </Link>
  );
};

const Page = () => {
  const navigate = useNavigate();
  const id = useParamWithSchema('id', z.coerce.bigint());
  const { result, isLoading, error } = useBlueprintDetails(id);
  const { isOperator, operatorAddress } = useOperatorInfo();
  const ss58Prefix = useNetworkStore((store) => store.network.ss58Prefix);
  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState(false);

  const isRegistered = useMemo(() => {
    if (operatorAddress === null || result?.operators === undefined) {
      return false;
    }

    return result.operators.some((operator) => {
      try {
        const opAddr = toSubstrateAddress(operator.address, ss58Prefix);
        return opAddr === operatorAddress;
      } catch {
        return false;
      }
    });
  }, [operatorAddress, result?.operators, ss58Prefix]);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <SkeletonLoader className="min-h-64" />

        <Typography variant="h4" fw="bold">
          Operators running
        </Typography>

        <SkeletonLoader className="min-h-52" />
      </div>
    );
  } else if (id === undefined || result === null) {
    return <Navigate to={PagePath.NOT_FOUND} />;
  } else if (error) {
    return <ErrorFallback title={error.name} />;
  }

  const handleBlueprintFormSubmit = (formResult: BlueprintFormResult) => {
    sessionStorage.setItem(
      SessionStorageKey.BLUEPRINT_REGISTRATION_PARAMS,
      JSON.stringify({
        rpcUrl: formResult.rpcUrl,
        selectedBlueprints: [
          {
            ...result.details,
            id: result.details.id.toString(),
          },
        ],
      }),
    );

    navigate(PagePath.BLUEPRINTS_REGISTRATION_REVIEW);
  };

  return (
    <div className="space-y-10">
      <BlueprintHeader
        blueprint={result.details}
        enableDeploy
        enableRegister={isOperator && !isRegistered}
        deployBtnProps={{
          onClick: (e) => {
            e.preventDefault();
            navigate(PagePath.BLUEPRINTS_DEPLOY.replace(':id', `${id ?? ''}`));
          },
        }}
        registerBtnProps={{
          onClick: () => setIsBlueprintModalOpen(true),
        }}
        isRegistered={isRegistered ?? false}
      />

      <div className="space-y-5">
        <Typography variant="h4" fw="bold">
          Registered Operators
        </Typography>

        <OperatorsTable
          RestakeOperatorAction={RestakeOperatorAction}
          data={result.operators}
        />
      </div>

      <Modal open={isBlueprintModalOpen} onOpenChange={setIsBlueprintModalOpen}>
        <ConfigureBlueprintModal
          onOpenChange={setIsBlueprintModalOpen}
          blueprints={[result.details]}
          onSubmit={handleBlueprintFormSubmit}
        />
      </Modal>
    </div>
  );
};

export default Page;
