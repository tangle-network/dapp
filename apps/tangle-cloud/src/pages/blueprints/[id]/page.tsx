'use client';

import BlueprintHeader from '@tangle-network/tangle-shared-ui/components/blueprints/BlueprintHeader';
import OperatorsTable from '@tangle-network/tangle-shared-ui/components/tables/Operators';
import useBlueprintDetails from '@tangle-network/tangle-shared-ui/data/restake/useBlueprintDetails';
import { ErrorFallback } from '@tangle-network/ui-components/components/ErrorFallback';
import SkeletonLoader from '@tangle-network/ui-components/components/SkeletonLoader';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { PropsWithChildren, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { PagePath, TangleDAppPagePath } from '../../../types';
import useRoleStore, { Role } from '../../../stores/roleStore';
import PricingModal from '../PricingModal';
import { Modal } from '@tangle-network/ui-components';
import { PricingFormResult } from '../PricingModal/types';
import { SessionStorageKey } from '../../../constants';

const RestakeOperatorAction = ({
  children,
  address,
}: PropsWithChildren<{ address: string }>) => {
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
  const { id } = useParams();
  const { result, isLoading, error } = useBlueprintDetails(id);
  const isOperator = useRoleStore().role === Role.OPERATOR;
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
  } else if (error) {
    return <ErrorFallback title={error.name} />;
  } else if (result === null) {
    // TODO: Show 404 page
    return null;
  }

  const handlePricingFormSubmit = (formResult: PricingFormResult) => {
    sessionStorage.setItem(
      SessionStorageKey.BLUEPRINT_REGISTRATION_PARAMS,
      JSON.stringify({
        pricingSettings: formResult,
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
              navigate(PagePath.BLUEPRINTS_DEPLOY.replace(':id', id ?? ''));
            }
          },
        }}
      />

      <div className="space-y-5">
        <Typography variant="h4" fw="bold">
          Operators running {result.details.name}
        </Typography>

        <OperatorsTable
          RestakeOperatorAction={RestakeOperatorAction}
          data={result.operators}
        />
      </div>

      <Modal open={isPricingModalOpen} onOpenChange={setIsPricingModalOpen}>
        <PricingModal
          onOpenChange={setIsPricingModalOpen}
          blueprints={[result.details]}
          onSubmit={handlePricingFormSubmit}
        />
      </Modal>
    </div>
  );
};

export default Page;
