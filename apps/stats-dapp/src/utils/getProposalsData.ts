import { AppEnumB6165934C8 as ProposalType } from '../generated/graphql';
import {
  AnchorCreateProposal,
  AnchorUpdateProposal,
  EVMProposal,
  FeeRecipientUpdateProposal,
  MaxDepositLimitProposal,
  MinWithdrawalLimitProposal,
  ProposerSetUpdateProposal,
  RefreshVoteProposal,
  RescueTokensProposal,
  ResourceIdUpdateProposal,
  SetTreasuryHandlerProposal,
  SetVerifierProposal,
  TokenAddProposal,
  TokenRemoveProposal,
  WrappingFeeUpdateProposal,
} from '@webb-tools/sdk-core';

import { hexToU8a, u8aToHex } from '@polkadot/util';
export function getProposalsData(
  propType: ProposalType,
  data: string
): Record<string, string | Record<string, any>> {
  const bytes = hexToU8a(data);
  switch (propType) {
    case ProposalType.AnchorCreateProposal: {
      const decoded = AnchorCreateProposal.fromBytes(bytes);
      return {
        encodedCall: decoded.encodedCall,
        functionSignature: u8aToHex(decoded.header.functionSignature),
        nonce: String(decoded.header.nonce),
        chainType: String(decoded.header.resourceId.chainType),
        chainId: String(decoded.header.resourceId.chainId),
        targetSystem: u8aToHex(decoded.header.resourceId.targetSystem),
      };
    }

    case ProposalType.AnchorUpdateProposal: {
      const decoded = AnchorUpdateProposal.fromBytes(bytes);
      return {
        merkleRoot: decoded.merkleRoot,
        functionSignature: u8aToHex(decoded.header.functionSignature),
        nonce: String(decoded.header.nonce),
        chainType: String(decoded.header.resourceId.chainType),
        chainId: String(decoded.header.resourceId.chainId),
        targetSystem: u8aToHex(decoded.header.resourceId.targetSystem),
      };
    }
    case ProposalType.EvmProposal: {
      const decoded = EVMProposal.fromBytes(bytes);
      return {
        merkleRoot: String(decoded.nonce),
        chainId: String(decoded.chainId),
        tx: { ...decoded.tx },
      };
    }

    case ProposalType.FeeRecipientUpdateProposal: {
      const decoded = FeeRecipientUpdateProposal.fromBytes(bytes);
      return {
        newFeeRecipient: decoded.newFeeRecipient,
        functionSignature: u8aToHex(decoded.header.functionSignature),
        nonce: String(decoded.header.nonce),
        chainType: String(decoded.header.resourceId.chainType),
        chainId: String(decoded.header.resourceId.chainId),
        targetSystem: u8aToHex(decoded.header.resourceId.targetSystem),
      };
    }
    case ProposalType.MaxDepositLimitUpdateProposal: {
      const decoded = MaxDepositLimitProposal.fromBytes(bytes);
      return {
        maxDepositLimitBytes: decoded.maxDepositLimitBytes,
        functionSignature: u8aToHex(decoded.header.functionSignature),
        nonce: String(decoded.header.nonce),
        chainType: String(decoded.header.resourceId.chainType),
        chainId: String(decoded.header.resourceId.chainId),
        targetSystem: u8aToHex(decoded.header.resourceId.targetSystem),
      };
    }
    case ProposalType.MinWithdrawalLimitUpdateProposal: {
      const decoded = MinWithdrawalLimitProposal.fromBytes(bytes);
      return {
        minWithdrawalLimitBytes: decoded.minWithdrawalLimitBytes,
        functionSignature: u8aToHex(decoded.header.functionSignature),
        nonce: String(decoded.header.nonce),
        chainType: String(decoded.header.resourceId.chainType),
        chainId: String(decoded.header.resourceId.chainId),
        targetSystem: u8aToHex(decoded.header.resourceId.targetSystem),
      };
    }

    case ProposalType.ProposerSetUpdateProposal: {
      const decoded = ProposerSetUpdateProposal.fromBytes(bytes);
      return {
        numberOfProposers: String(decoded.numberOfProposers),
        averageSessionLength: String(decoded.averageSessionLength),
        nonce: String(decoded.nonce),
        merkleRoot: decoded.merkleRoot,
      };
    }

    case ProposalType.RefreshVote: {
      const decoded = RefreshVoteProposal.fromBytes(bytes);
      return {
        nonce: String(decoded.nonce),
        publicKey: String(decoded.publicKey),
      };
    }

    case ProposalType.RescueTokensProposal: {
      const decoded = RescueTokensProposal.fromBytes(bytes);
      return {
        toAddress: decoded.toAddress,
        tokenAddress: decoded.tokenAddress,
        amount: decoded.amount,
        functionSignature: u8aToHex(decoded.header.functionSignature),
        nonce: String(decoded.header.nonce),
        chainType: String(decoded.header.resourceId.chainType),
        chainId: String(decoded.header.resourceId.chainId),
        targetSystem: u8aToHex(decoded.header.resourceId.targetSystem),
      };
    }

    case ProposalType.ResourceIdUpdateProposal: {
      const decoded = ResourceIdUpdateProposal.fromBytes(bytes);
      return {
        handlerAddress: decoded.handlerAddress,
        newResourceId: decoded.newResourceId,
        functionSignature: u8aToHex(decoded.header.functionSignature),
        nonce: String(decoded.header.nonce),
        chainType: String(decoded.header.resourceId.chainType),
        chainId: String(decoded.header.resourceId.chainId),
        targetSystem: u8aToHex(decoded.header.resourceId.targetSystem),
      };
    }
    case ProposalType.SetTreasuryHandlerProposal: {
      const decoded = SetTreasuryHandlerProposal.fromBytes(bytes);
      return {
        newTreasuryHandler: decoded.newTreasuryHandler,
        chainType: String(decoded.header.resourceId.chainType),
        chainId: String(decoded.header.resourceId.chainId),
        targetSystem: u8aToHex(decoded.header.resourceId.targetSystem),
        functionSignature: u8aToHex(decoded.header.functionSignature),
        nonce: String(decoded.header.nonce),
      };
    }

    case ProposalType.SetVerifierProposal: {
      const decoded = SetVerifierProposal.fromBytes(bytes);
      return {
        newVerifier: decoded.newVerifier,
        functionSignature: u8aToHex(decoded.header.functionSignature),
        nonce: String(decoded.header.nonce),
        chainType: String(decoded.header.resourceId.chainType),
        chainId: String(decoded.header.resourceId.chainId),
        targetSystem: u8aToHex(decoded.header.resourceId.targetSystem),
      };
    }
    case ProposalType.TokenAddProposal: {
      const decoded = TokenAddProposal.fromBytes(bytes);
      return {
        newTokenAddress: decoded.newTokenAddress,
        functionSignature: u8aToHex(decoded.header.functionSignature),
        nonce: String(decoded.header.nonce),
        chainType: String(decoded.header.resourceId.chainType),
        chainId: String(decoded.header.resourceId.chainId),
        targetSystem: u8aToHex(decoded.header.resourceId.targetSystem),
      };
    }
    case ProposalType.TokenRemoveProposal: {
      const decoded = TokenRemoveProposal.fromBytes(bytes);
      return {
        removeTokenAddress: decoded.removeTokenAddress,
        functionSignature: u8aToHex(decoded.header.functionSignature),
        nonce: String(decoded.header.nonce),
        chainType: String(decoded.header.resourceId.chainType),
        chainId: String(decoded.header.resourceId.chainId),
        targetSystem: u8aToHex(decoded.header.resourceId.targetSystem),
      };
    }
    case ProposalType.Unknown:
      break;
    case ProposalType.WrappingFeeUpdateProposal: {
      const decoded = WrappingFeeUpdateProposal.fromBytes(bytes);
      return {
        newFee: decoded.newFee,
        functionSignature: u8aToHex(decoded.header.functionSignature),
        nonce: String(decoded.header.nonce),
        chainType: String(decoded.header.resourceId.chainType),
        chainId: String(decoded.header.resourceId.chainId),
        targetSystem: u8aToHex(decoded.header.resourceId.targetSystem),
      };
    }
  }
  return { data };
}
