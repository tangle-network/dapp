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
import ConfigurePricingModal from '../ConfigurePricingModal';
import { Modal } from '@tangle-network/ui-components';
import type { PricingFormResult } from '../ConfigurePricingModal/types';
import { SessionStorageKey } from '../../../constants';
import useOperatorInfo from '../../../hooks/useOperatorInfo';
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
  const { isOperator } = useOperatorInfo();
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

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

  const handlePricingFormSubmit = (formResult: PricingFormResult) => {
    sessionStorage.setItem(
      SessionStorageKey.BLUEPRINT_REGISTRATION_PARAMS,
      JSON.stringify({
        pricingSettings: formResult,
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
        enableRegister={isOperator}
        deployBtnProps={{
          onClick: (e) => {
            e.preventDefault();
            navigate(PagePath.BLUEPRINTS_DEPLOY.replace(':id', `${id ?? ''}`));
          },
        }}
        registerBtnProps={{
          onClick: (e) => {
            e.preventDefault();
            setIsPricingModalOpen(true);
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
