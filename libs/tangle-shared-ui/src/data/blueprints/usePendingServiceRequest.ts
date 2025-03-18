import { useCallback } from 'react';
import { toPrimitiveServiceRequest } from './utils/toPrimitiveService';
import { catchError, map, of, switchMap } from 'rxjs';
import useApiRx from '../../hooks/useApiRx';
import { TangleError, TangleErrorCode } from '../../types/error';
import { MonitoringServiceRequest } from './utils/type';
import { createPendingServiceRequests } from './utils/blueprintHelpers';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { toPrimitiveBlueprint } from './utils/toPrimitiveBlueprint';

export default function usePendingServiceRequest(
  operatorAccountAddress: SubstrateAddress | null,
) {
  const { result, ...rest } = useApiRx(
    useCallback(
      (apiRx) => {
        if (apiRx.query?.services?.serviceRequests === undefined) {
          return new TangleError(TangleErrorCode.FEATURE_NOT_SUPPORTED);
        }

        if (!operatorAccountAddress) {
          return of<MonitoringServiceRequest[]>([]);
        }

        const servicesWithBlueprintsEntries$ =
          apiRx.query.services.serviceRequests.entries();

        const toPrimitiveServiceRequestsPipe$ =
          servicesWithBlueprintsEntries$.pipe(
            map((serviceRequestEntries) => {
              let pendingServiceRequests = serviceRequestEntries.map(
                ([requestId, serviceRequest]) => {
                  return toPrimitiveServiceRequest(
                    requestId[0],
                    serviceRequest.unwrap(),
                  );
                },
              );

              pendingServiceRequests = pendingServiceRequests.filter(
                (serviceRequest) => {
                  return serviceRequest.operatorsWithApprovalState.some(
                    (operator) => {
                      return (
                        operator.operator === operatorAccountAddress &&
                        operator.approvalStateStatus === 'Pending'
                      );
                    },
                  );
                },
              );

              return pendingServiceRequests;
            }),
          );

        return toPrimitiveServiceRequestsPipe$.pipe(
          switchMap((primitiveServiceRequests) => {
            const blueprintIds = primitiveServiceRequests.map(
              (serviceRequest) => serviceRequest.blueprint,
            );

            return apiRx.query.services.blueprints.multi(blueprintIds).pipe(
              map((blueprints) => {
                const blueprintsData = blueprints
                  .map((blueprint) => blueprint.unwrap())
                  .map(([_, blueprint]) => toPrimitiveBlueprint(blueprint));
                return createPendingServiceRequests(
                  primitiveServiceRequests,
                  blueprintsData,
                );
              }),
            );
          }),
          catchError((error) => {
            console.error(
              'Error querying services with blueprints by operator:',
              error,
            );
            return of<MonitoringServiceRequest[]>([]);
          }),
        );
      },
      [operatorAccountAddress],
    ),
  );

  return {
    blueprints: result ?? [],
    ...rest,
  };
}