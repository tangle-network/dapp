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
import useEvmCallPermitNonce from './useEvmCallPermitNonce';

const PATHNAME = '/api/v1/relay';
const DEADLINE_MINUTES = 30;
const MAX_GAS_LIMIT = 60_000;

const ALLOWED_CALLS: Partial<Record<PrecompileAddress, string[]>> = {
  [PrecompileAddress.RESTAKING]: [
    'deposit',
    'delegate',
  ] as const satisfies ExtractAbiFunctionNames<
    typeof RESTAKING_PRECOMPILE_ABI
  >[],
};

const TYPES = {
  EIP712Domain: [
    {
      name: 'name',
      type: 'string',
    },
    {
      name: 'version',
      type: 'string',
    },
    {
      name: 'chainId',
      type: 'uint256',
    },
    {
      name: 'verifyingContract',
      type: 'address',
    },
  ],
  CallPermit: [
    {
      name: 'from',
      type: 'address',
    },
    {
      name: 'to',
      type: 'address',
    },
    {
      name: 'value',
      type: 'uint256',
    },
    {
      name: 'data',
      type: 'bytes',
    },
    {
      name: 'gaslimit',
      type: 'uint64',
    },
    {
      name: 'nonce',
      type: 'uint256',
    },
    {
      name: 'deadline',
      type: 'uint256',
    },
  ],
} as const;

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

  const {
    network: { evmChainId, evmTxRelayerEndpoint },
  } = useNetworkStore();

  const walletClient = useViemWalletClient(WalletClientTransport.WINDOW);
  const estimateGas = useEvmGasEstimate();
  const nonce = useEvmCallPermitNonce();

  const isReady =
    evmAddress !== null &&
    evmTxRelayerEndpoint !== undefined &&
    walletClient !== null &&
    evmChainId !== undefined &&
    nonce !== null;

  const signTx = useCallback(
    async (
      data: Hex,
      destination: EvmAddress,
      deadlineSeconds: number,
      nonce: bigint,
      gasLimit: bigint,
    ) => {
      assert(isReady);

      // EIP-712 domain, types, and message.
      const domain = {
        name: 'Call Permit Precompile',
        version: '1',
        chainId: BigInt(evmChainId),
        verifyingContract: PrecompileAddress.CALL_PERMIT,
      };

      const message = {
        data,
        from: evmAddress,
        to: destination,
        value: BigInt(0),
        nonce,
        // For signing, the deadline should be in decimal form, not hex.
        deadline: BigInt(deadlineSeconds),
        gaslimit: gasLimit,
      };

      const signature = await walletClient.signTypedData({
        account: evmAddress,
        domain,
        types: TYPES,
        primaryType: 'CallPermit',
        message,
      });

      const { v, r, s } = parseSignature(signature);

      return { v: v !== undefined ? Number(v) : undefined, r, s };
    },
    [evmAddress, isReady, evmChainId, walletClient],
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
      assert(isReady);

      const currentTimeSeconds = Math.floor(Date.now() / 1000);
      const deadlineSeconds = currentTimeSeconds + DEADLINE_MINUTES * 60;
      const deadline = `0x${deadlineSeconds.toString(16)}` as const;
      const destination = assertEvmAddress(precompileAddress);

      const callData = encodeFunctionData({
        abi: abi satisfies AbiFunction[] as AbiFunction[],
        functionName: functionName satisfies string as string,
        args,
      });

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

      const { v, r, s } = await signTx(
        callData,
        destination,
        deadlineSeconds,
        nonce,
        BigInt(gasLimit),
      );

      const url = new URL(evmTxRelayerEndpoint);

      url.pathname = PATHNAME;
      console.debug('Obtained signature:', { v, r, s });

      if (v === undefined) {
        return new Error(
          'Failed to obtain signature: recovery ID is undefined, possibly indicating an invalid or malformed signature.',
        );
      }

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
    [estimateGas, evmAddress, evmTxRelayerEndpoint, isReady, nonce, signTx],
  );

  return isReady ? relayEvmTx : null;
};

export default useEvmTxRelayer;
