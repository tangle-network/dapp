'use client';

import BlueprintHeader from '@tangle-network/tangle-shared-ui/components/blueprints/BlueprintHeader';
import OperatorsTable from '@tangle-network/tangle-shared-ui/components/tables/Operators';
import useBlueprintDetails from '@tangle-network/tangle-shared-ui/data/restake/useBlueprintDetails';
import { ErrorFallback } from '@tangle-network/ui-components/components/ErrorFallback';
import SkeletonLoader from '@tangle-network/ui-components/components/SkeletonLoader';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { type FC, type PropsWithChildren, useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { PagePath, TangleDAppPagePath } from '../../../types';
import useRoleStore, { Role } from '../../../stores/roleStore';
import ConfigurePricingModal from '../ConfigurePricingModal';
import { Modal } from '@tangle-network/ui-components';
import type { PricingFormResult } from '../ConfigurePricingModal/types';
import { SessionStorageKey } from '../../../constants';
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
  const role = useRoleStore((store) => store.role);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  const isOperator = role === Role.OPERATOR;

  if (id === undefined) {
    return <Navigate to={PagePath.NOT_FOUND} />;
  } else if (isLoading) {
    return (
      <div className="space-y-5">
        <SkeletonLoader className="min-h-64" />

        <Typography variant="h4" fw="bold">
          Operators running
        </Typography>

        <SkeletonLoader className="min-h-52" />
      </div>
    );
  }
  // TODO: If the blueprint is not found, it's showing this error fallback. Instead, it should redirect to the not found page.
  else if (error) {
    return <ErrorFallback description={[error.message]} />;
  } else if (isLoading || result === null) {
    return (
      <div className="space-y-5">
        <SkeletonLoader className="min-h-64" />

        <Typography variant="h4" fw="bold">
          Registered Operators
        </Typography>

        <SkeletonLoader className="min-h-52" />
      </div>
    );
  }

  const handlePricingFormSubmit = (formResult: PricingFormResult) => {
    sessionStorage.setItem(
      SessionStorageKey.BLUEPRINT_REGISTRATION_PARAMS,
      JSON.stringify({
        pricingSettings: formResult,
        // TODO: This includes bigints, which aren't JSON-serializable. This leads to an error when saving the form result to session storage. Need to fix this.
        selectedBlueprints: [result.details],
      }),
    );

    navigate(PagePath.BLUEPRINTS_REGISTRATION_REVIEW);
  };

  return (
    <div className="space-y-10">
      <BlueprintHeader
        blueprint={result.details}
        actionProps={{
          children: isOperator ? 'Register' : 'Deploy',
          onClick: (e) => {
            e.preventDefault();

            if (isOperator) {
              setIsPricingModalOpen(true);
            } else {
              navigate(
                PagePath.BLUEPRINTS_DEPLOY.replace(':id', id.toString()),
              );
            }
          },
        }}
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

      <Modal open={isPricingModalOpen} onOpenChange={setIsPricingModalOpen}>
        <ConfigurePricingModal
          onOpenChange={setIsPricingModalOpen}
          blueprints={[result.details]}
          onSubmit={handlePricingFormSubmit}
        />
      </Modal>
    </div>
  );
};

export default Page;
