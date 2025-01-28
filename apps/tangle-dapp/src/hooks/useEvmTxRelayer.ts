import axios, { AxiosResponse } from 'axios';
import { useCallback } from 'react';
import {
  AbiFunction,
  encodeFunctionData,
  Hash,
  Hex,
  parseSignature,
} from 'viem';
import {
  ExtractAbiFunctionNames,
  FindAbiArgsOf,
  PrecompileAddress,
  ZERO_ADDRESS,
} from '../constants/evmPrecompiles';
import { EvmAddress } from '@webb-tools/webb-ui-components/types/address';
import { assertEvmAddress } from '@webb-tools/webb-ui-components';
import assert from 'assert';
import useViemWalletClient, {
  WalletClientTransport,
} from './useViemWalletClient';
import useAgnosticAccountInfo from '@webb-tools/tangle-shared-ui/hooks/useAgnosticAccountInfo';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import ensureError from '@webb-tools/tangle-shared-ui/utils/ensureError';
import RESTAKING_PRECOMPILE_ABI from '../abi/restaking';
import useEvmGasEstimate from './useEvmGasEstimate';

const PATHNAME = '/api/v1/relay';
const DEADLINE_MINUTES = 10;
const MAX_GAS_LIMIT = 60_000;

const ALLOWED_CALLS: Partial<Record<PrecompileAddress, string[]>> = {
  [PrecompileAddress.RESTAKING]: [
    'deposit',
    'delegate',
  ] as const satisfies ExtractAbiFunctionNames<
    typeof RESTAKING_PRECOMPILE_ABI
  >[],
};

const EIP712_TYPES = {
  Permit: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'data', type: 'bytes' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
};

/**
 * @see https://github.com/tangle-network/txrelayer-blueprint/blob/main/API.md#request-body
 */
type RequestBody = {
  /**
   * The address initiating the transaction.
   */
  from: EvmAddress;

  /**
   * The target contract address.
   */
  to: EvmAddress;

  /**
   * Amount of native tokens to send (in hex)
   */
  value: Hex;

  /**
   * Encoded function call data.
   */
  data: Hex;

  /**
   * Maximum gas allowed for the transaction.
   *
   * Should be set appropriately for the transaction being executed.
   */
  gaslimit: number;

  /**
   * Timestamp when the signature expires (in hex).
   *
   * Should be a future timestamp to ensure the transaction doesn't expire.
   */
  deadline: Hex;

  /**
   * Recovery ID from the signature.
   */
  v: number;

  /**
   * R component of the signature.
   */
  r: Hex;

  /**
   * S component of the signature.
   */
  s: Hex;
};

export type EvmTxRelaySuccessResult = {
  txHash: Hash;
  simulatedOutcome: Hex;
};

type Response =
  | ({ status: 'success' } & EvmTxRelaySuccessResult)
  | {
      status: 'failure';
      error: string;

      /**
       * Additional error details if available.
       */
      details?: string;
    };

/**
 * Check whether a specific EVM precompile function is eligible to be
 * subsidized by the EVM transaction relayer.
 */
export const isEvmTxRelayerEligible = <
  Abi extends AbiFunction[],
  FunctionName extends ExtractAbiFunctionNames<Abi>,
>(
  precompileAddress: PrecompileAddress,
  functionName: FunctionName,
): boolean => {
  if (ALLOWED_CALLS[precompileAddress] === undefined) {
    return false;
  }

  return ALLOWED_CALLS[precompileAddress].includes(functionName);
};

/**
 * Obtain a function to send signed transactions to a relayer API.
 * This acts as a subsidy for EVM accounts that do not have balances
 * to pay for transaction fees.
 */
const useEvmTxRelayer = () => {
  const { evmAddress } = useAgnosticAccountInfo();
  const { network } = useNetworkStore();
  const walletClient = useViemWalletClient(WalletClientTransport.WINDOW);
  const estimateGas = useEvmGasEstimate();

  const isReady =
    evmAddress !== null &&
    network.evmTxRelayerEndpoint !== undefined &&
    walletClient !== null;

  const signTx = useCallback(
    async (data: Hex, destination: EvmAddress, deadlineSeconds: number) => {
      // TODO: Temp. assertion.
      assert(walletClient !== null && evmAddress !== null);

      // EIP-712 domain, types, and message.
      const domain = {
        name: 'TangleEvmTxRelayer',
        version: '1',
        chainId: network.evmChainId,
        verifyingContract: destination,
      };

      const message = {
        data,
        from: evmAddress,
        to: destination,
        value: 0,
        // TODO: Nonce.
        nonce: 0,
        // For signing, the deadline should be in decimal form, not hex.
        deadline: deadlineSeconds,
        // TODO: Additional fields if the contract requires them.
      };

      const signature = await walletClient.signTypedData({
        account: evmAddress,
        domain,
        types: EIP712_TYPES,
        primaryType: 'Permit',
        message,
      });

      const { v, r, s } = parseSignature(signature);

      return { v: v !== undefined ? Number(v) : undefined, r, s };
    },
    [evmAddress, network.evmChainId, walletClient],
  );

  const relayEvmTx = useCallback(
    async <
      Abi extends AbiFunction[],
      FunctionName extends ExtractAbiFunctionNames<Abi>,
    >(
      abi: Abi,
      precompileAddress: PrecompileAddress,
      functionName: FunctionName,
      args: FindAbiArgsOf<Abi, FunctionName>,
    ): Promise<Error | EvmTxRelaySuccessResult> => {
      assert(
        evmAddress !== null &&
          network.evmTxRelayerEndpoint !== undefined &&
          walletClient !== null,
      );

      const currentTimeSeconds = Math.floor(Date.now() / 1000);
      const deadlineSeconds = currentTimeSeconds + DEADLINE_MINUTES * 10;
      const deadline = `0x${deadlineSeconds.toString(16)}` as const;
      const destination = assertEvmAddress(precompileAddress);

      const callData = encodeFunctionData({
        abi: abi satisfies AbiFunction[] as AbiFunction[],
        functionName: functionName satisfies string as string,
        args,
      });

      const { v, r, s } = await signTx(callData, destination, deadlineSeconds);
      const url = new URL(network.evmTxRelayerEndpoint);

      url.pathname = PATHNAME;
      console.debug('Obtained signature:', { v, r, s });

      if (v === undefined) {
        return new Error(
          'Failed to obtain signature: recovery ID is undefined, possibly indicating an invalid or malformed signature.',
        );
      }

      const gasEstimate = await estimateGas(abi, precompileAddress, {
        functionName,
        arguments: args,
      });

      // If the estimate is null, or exceeds the maximum gas limit,
      // use the maximum. Otherwise, it must be lower than the maximum;
      // and thus it can fit within a 32-bit integer.
      const gasLimit =
        gasEstimate === null
          ? MAX_GAS_LIMIT
          : gasEstimate > BigInt(MAX_GAS_LIMIT)
            ? MAX_GAS_LIMIT
            : Number(gasEstimate);

      try {
        const response = await axios.post<
          Response,
          AxiosResponse<Response, unknown>,
          RequestBody
        >(url.toString(), {
          from: evmAddress,
          to: destination,
          value: ZERO_ADDRESS,
          gaslimit: gasLimit,
          data: callData,
          deadline,
          v,
          r,
          s,
        });

        if (response.data.status === 'success') {
          return response.data;
        } else {
          return response.data.details !== undefined
            ? new Error(`${response.data.error}; ${response.data.details}`)
            : new Error(response.data.error);
        }
      } catch (possibleError) {
        return ensureError(possibleError);
      }
    },
    [
      estimateGas,
      evmAddress,
      network.evmTxRelayerEndpoint,
      signTx,
      walletClient,
    ],
  );

  return isReady ? relayEvmTx : null;
};

export default useEvmTxRelayer;
