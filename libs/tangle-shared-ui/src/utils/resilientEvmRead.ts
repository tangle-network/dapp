import type { Abi, Address, PublicClient } from 'viem';
import { multicall, readContract } from 'viem/actions';

export type ResilientContractCall = {
  address: Address;
  abi: Abi;
  functionName: string;
  args?: readonly unknown[];
  value?: bigint;
};

export type ResilientCallResult =
  | { status: 'success'; result: unknown }
  | { status: 'failure'; error: unknown };

export const isNetworkishError = (error: unknown): boolean => {
  const message = String((error as any)?.message ?? error);
  return (
    message.includes('Failed to fetch') ||
    message.includes('NetworkError') ||
    message.includes('ECONNREFUSED') ||
    message.includes('timeout') ||
    message.includes('timed out')
  );
};

export const isZeroDataDecodeError = (error: unknown): boolean => {
  const message = String((error as any)?.message ?? error);
  return message.includes('Cannot decode zero data ("0x")');
};

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

type ReadContractClient = unknown;

export const readContractResilient = async (
  publicClient: PublicClient,
  connectorClient: ReadContractClient | null | undefined,
  call: ResilientContractCall,
  options?: { retryDelayMs?: number },
): Promise<unknown> => {
  const retryDelayMs = options?.retryDelayMs ?? 75;

  const readViaPublic = async () =>
    publicClient.readContract({
      address: call.address,
      abi: call.abi,
      functionName: call.functionName as never,
      args: (call.args ?? []) as never,
    });

  const readViaConnector = async () => {
    if (!connectorClient) {
      throw new Error('Connector client not available');
    }

    return readContract(connectorClient as any, {
      address: call.address,
      abi: call.abi,
      functionName: call.functionName as never,
      args: (call.args ?? []) as never,
    });
  };

  try {
    return await readViaPublic();
  } catch (publicError) {
    // Anvil (and some providers) can very rarely return `0x` for eth_call under load.
    // Retry once before falling back to the connector.
    if (isZeroDataDecodeError(publicError)) {
      await delay(retryDelayMs);
      try {
        return await readViaPublic();
      } catch {
        // fall through
      }
    }

    if (!connectorClient) {
      throw publicError;
    }

    try {
      return await readViaConnector();
    } catch (connectorError) {
      if (isZeroDataDecodeError(connectorError)) {
        await delay(retryDelayMs);
        return await readViaConnector();
      }

      throw connectorError;
    }
  }
};

export const readContractsResilient = async (
  publicClient: PublicClient,
  connectorClient: ReadContractClient | null | undefined,
  calls: ResilientContractCall[],
): Promise<ResilientCallResult[]> => {
  if (calls.length === 0) {
    return [];
  }

  const canMulticall =
    publicClient.chain?.contracts?.multicall3?.address !== undefined;

  const runIndividual = async (
    targets: Array<{ call: ResilientContractCall; index: number }>,
    into: ResilientCallResult[],
  ) => {
    await Promise.allSettled(
      targets.map(async ({ call, index }) => {
        try {
          const result = await readContractResilient(
            publicClient,
            connectorClient,
            call,
          );
          into[index] = { status: 'success', result };
        } catch (error) {
          into[index] = { status: 'failure', error };
        }
      }),
    );
  };

  const results: ResilientCallResult[] = calls.map(() => ({
    status: 'failure',
    error: new Error('not executed'),
  }));

  if (!canMulticall) {
    await runIndividual(
      calls.map((call, index) => ({ call, index })),
      results,
    );
    return results;
  }

  try {
    const multicallResults = (await multicall(publicClient as any, {
      contracts: calls.map((c) => ({
        address: c.address,
        abi: c.abi,
        functionName: c.functionName,
        args: c.args ?? [],
      })),
      allowFailure: true,
    })) as Array<
      | { status: 'success'; result: unknown }
      | { status: 'failure'; error: unknown }
    >;

    // If everything failed, fall back to individual calls (broken/missing multicall3 is common).
    if (multicallResults.every((r) => r.status === 'failure')) {
      await runIndividual(
        calls.map((call, index) => ({ call, index })),
        results,
      );
      return results;
    }

    // Copy successes; retry failures individually.
    const failedTargets: Array<{ call: ResilientContractCall; index: number }> =
      [];
    multicallResults.forEach((r, index) => {
      if (r.status === 'success') {
        results[index] = { status: 'success', result: r.result };
      } else {
        results[index] = { status: 'failure', error: r.error };
        failedTargets.push({ call: calls[index], index });
      }
    });

    if (failedTargets.length > 0) {
      await runIndividual(failedTargets, results);
    }

    return results;
  } catch {
    await runIndividual(
      calls.map((call, index) => ({ call, index })),
      results,
    );
    return results;
  }
};
