import { isAddress } from '@polkadot/util-crypto';
import { FC } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import { IS_PRODUCTION_ENV } from '../../../constants/env';
import InfoCard from './InfoCard';
import NodeSpecificationsTable from './NodeSpecificationsTable';

const pageConfig = {
  metadata: {
    title: 'Validator Details | Tangle Network',
    description: 'View detailed information about a Tangle Network validator',
  },
};

const ValidatorDetails: FC = () => {
  const { validatorAddress } = useParams<{ validatorAddress: string }>();

  if (!validatorAddress || !isAddress(validatorAddress)) {
    return <Navigate to="/nomination" replace />;
  }

  return (
    <>
      <Helmet>
        <title>{pageConfig.metadata.title}</title>
        <meta name="description" content={pageConfig.metadata.description} />
      </Helmet>

      <div className="my-5 space-y-10">
        <div className="flex flex-col items-stretch gap-5 lg:flex-row">
          <InfoCard validatorAddress={validatorAddress} className="flex-1" />
        </div>

        {/* TODO: Hide this for now */}
        {!IS_PRODUCTION_ENV && (
          <NodeSpecificationsTable validatorAddress={validatorAddress} />
        )}
      </div>
    </>
  );
};

export default ValidatorDetails;
