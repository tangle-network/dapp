'use client';

import BlueprintHeader from '@tangle-network/tangle-shared-ui/components/blueprints/BlueprintHeader';
import OperatorsTable from '@tangle-network/tangle-shared-ui/components/tables/Operators';
import { useBlueprintDetails } from '@tangle-network/tangle-shared-ui/data/graphql';
import { ErrorFallback } from '@tangle-network/ui-components/components/ErrorFallback';
import SkeletonLoader from '@tangle-network/ui-components/components/SkeletonLoader';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { type FC, type PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { PagePath, TangleDAppPagePath } from '../../../types';
import pollWithBackoff from '../../../utils/pollWithBackoff';
import RegistrationDrawer from '../RegistrationDrawer';
import useOperatorInfo from '@tangle-network/tangle-shared-ui/hooks/useOperatorInfo';
import useParamWithSchema from '@tangle-network/tangle-shared-ui/hooks/useParamWithSchema';
import { z } from 'zod';
import { useAccount } from 'wagmi';

const RestakeOperatorAction: FC<PropsWithChildren<{ address: string }>> = ({
  children,
}) => {
  return (
    <Link to={TangleDAppPagePath.RESTAKE_DELEGATE} target="_blank">
      {children}
    </Link>
  );
};

const Page = () => {
  const navigate = useNavigate();
  const id = useParamWithSchema('id', z.coerce.bigint());
  const { result, isLoading, error, refetch } = useBlueprintDetails(id);
  const { isOperator } = useOperatorInfo();
  const { address: userAddress } = useAccount();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Check if the current user is registered as an operator for this blueprint
  const isRegistered = useMemo(() => {
    if (!userAddress || result?.operators === undefined) {
      return false;
    }

    return result.operators.some((operator) => {
      return operator.address.toLowerCase() === userAddress.toLowerCase();
    });
  }, [userAddress, result?.operators]);

  const handleRegistrationComplete = useCallback(async () => {
    setIsDrawerOpen(false);

    // Poll with exponential backoff until indexer reflects the new registration
    await pollWithBackoff(async () => {
      await refetch();

      // Check if the user is now in the operators list
      if (!result || !userAddress) {
        return false;
      }

      return result.operators.some(
        (operator) =>
          operator.address.toLowerCase() === userAddress.toLowerCase(),
      );
    });
  }, [refetch, userAddress, result]);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <SkeletonLoader className="min-h-64" />

        <SkeletonLoader className="min-h-52" />
      </div>
    );
  } else if (id === undefined || result === null) {
    return <Navigate to={PagePath.NOT_FOUND} />;
  } else if (error) {
    return <ErrorFallback title={error.name} />;
  }

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
          onClick: () => setIsDrawerOpen(true),
        }}
        isRegistered={isRegistered ?? false}
      />

      <div className="space-y-5">
        {!isLoading && (
          <Typography variant="h4" fw="bold">
            Registered Operators
          </Typography>
        )}

        <OperatorsTable
          RestakeOperatorAction={RestakeOperatorAction}
          data={result.operators as any} // Type mismatch until OperatorsTable is updated for EVM
          isLoading={isLoading}
        />
      </div>

      <RegistrationDrawer
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        blueprints={[result.details]}
        onRegistrationComplete={handleRegistrationComplete}
      />
    </div>
  );
};

export default Page;
