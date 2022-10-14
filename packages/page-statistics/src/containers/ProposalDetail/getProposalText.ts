import { ProposalType } from '@webb-dapp/page-statistics/generated/graphql';
import {
  AnchorUpdateProposal,
  MaxDepositLimitProposal,
  MinWithdrawalLimitProposal,
  RescueTokensProposal,
  ResourceIdUpdateProposal,
  TokenAddProposal,
  TokenRemoveProposal,
  WrappingFeeUpdateProposal,
} from '@webb-tools/sdk-core';

import { hexToU8a, u8aToHex } from '@polkadot/util';
export function getProposalText(propType: ProposalType, data: string): Record<string, string> {
  const bytes = hexToU8a(data);
  switch (propType) {
    case ProposalType.AnchorCreateProposal:
      break;
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
    case ProposalType.EvmProposal:
      break;
    case ProposalType.FeeRecipientUpdateProposal:
      break;
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

    case ProposalType.ProposerSetUpdateProposal:
      break;
    case ProposalType.RefreshVote:
      break;
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
    case ProposalType.SetTreasuryHandlerProposal:
      break;
    case ProposalType.SetVerifierProposal:
      break;
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
