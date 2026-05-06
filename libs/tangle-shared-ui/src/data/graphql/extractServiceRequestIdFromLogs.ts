import { parseEventLogs } from 'viem';
import TangleABI from '../../abi/tangle';

type ServiceRequestEventName =
  | 'ServiceRequested'
  | 'ServiceRequestedWithSecurity';

export const extractServiceRequestIdFromLogs = (
  logs: readonly unknown[],
): bigint | undefined => {
  const eventNames: ServiceRequestEventName[] = [
    'ServiceRequested',
    'ServiceRequestedWithSecurity',
  ];

  for (const eventName of eventNames) {
    try {
      const parsed = parseEventLogs({
        abi: TangleABI,
        logs: logs as Parameters<typeof parseEventLogs>[0]['logs'],
        eventName,
      });

      const event = parsed[0] as unknown as
        | { args: { requestId: bigint } }
        | undefined;
      const requestId = event?.args?.requestId;

      if (requestId !== undefined) {
        return requestId;
      }
    } catch {
      // Best-effort parsing; continue checking other supported request events.
    }
  }

  return undefined;
};

export default extractServiceRequestIdFromLogs;
