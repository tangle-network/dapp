import { useCallback, useMemo } from 'react';
import { toPrimitiveServiceRequest } from './utils/toPrimitiveService';
import { catchError, map, of } from 'rxjs';
import useApiRx from '../../hooks/useApiRx';
import { TangleError, TangleErrorCode } from '../../types/error';
import { createPendingServiceRequests } from './utils/blueprintHelpers';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { toPrimitiveBlueprint } from './utils/toPrimitiveBlueprint';
import { toSubstrateAddress } from '@tangle-network/ui-components/utils/toSubstrateAddress';
import useNetworkStore from '../../context/useNetworkStore';

const usePendingServiceRequest = (
  operatorAccountAddress: SubstrateAddress | null,
) => {
  const { network } = useNetworkStore();
  const { result: serviceRequestEntries } = useApiRx(
    useCallback(
      (apiRx) => {
        if (apiRx.query?.services?.serviceRequests === undefined) {
          return new TangleError(TangleErrorCode.FEATURE_NOT_SUPPORTED);
        }

        if (!operatorAccountAddress) {
          return of([]);
        }

        return apiRx.query.services.serviceRequests.entries().pipe(
          map((entries) => entries),
          catchError((error) => {
            console.error('Error querying service requests:', error);
            return of([]);
          }),
        );
      },
      [operatorAccountAddress],
    ),
  );

  const primitiveServiceRequests = useMemo(() => {
    if (!serviceRequestEntries) return [];

    const allServiceRequests = serviceRequestEntries.map(
      ([requestId, serviceRequest]) =>
        toPrimitiveServiceRequest(
          requestId as any,
          (serviceRequest as any).unwrap(),
        ),
    );

    const filtered = allServiceRequests.filter((serviceRequest) => {
      const hasMatchingOperator =
        serviceRequest.operatorsWithApprovalState.some((operator) => {
          // Normalize both addresses to the same format for comparison
          const normalizedChainOperator = toSubstrateAddress(
            operator.operator,
            network.ss58Prefix,
          );
          const normalizedCurrentOperator = operatorAccountAddress
            ? toSubstrateAddress(operatorAccountAddress, network.ss58Prefix)
            : null;

          const addressMatch =
            normalizedChainOperator === normalizedCurrentOperator;
          const statusMatch = operator.approvalStateStatus === 'Pending';

          return addressMatch && statusMatch;
        });

      return hasMatchingOperator;
    });

    return filtered;
  }, [serviceRequestEntries, operatorAccountAddress, network.ss58Prefix]);

  const blueprintIds = useMemo(() => {
    return primitiveServiceRequests.map(
      (serviceRequest) => serviceRequest.blueprint,
    );
  }, [primitiveServiceRequests]);

  const { result: blueprints, ...rest } = useApiRx(
    useCallback(
      (apiRx) => {
        if (!blueprintIds.length) return of([]);

        return apiRx.query.services.blueprints.multi(blueprintIds).pipe(
          map((blueprints) =>
            blueprints
              .map((blueprint) => (blueprint as any).unwrap())
              .map(([owner, blueprint]) => ({
                owner: owner.toHuman(),
                blueprint: toPrimitiveBlueprint(blueprint),
              })),
          ),
          catchError((error) => {
            console.error('Error querying blueprints:', error);
            return of([]);
          }),
        );
      },
      [blueprintIds],
    ),
  );

  const finalResult = useMemo(() => {
    if (!blueprints || !primitiveServiceRequests.length) return [];
    return createPendingServiceRequests(primitiveServiceRequests, blueprints);
  }, [primitiveServiceRequests, blueprints]);

  return {
    blueprints: finalResult,
    ...rest,
  };
};

export default usePendingServiceRequest;
