import { parseAddressOrThrow } from '../../utils/safeParseAddress';
import type { DeveloperPaymentEvent } from './useDeveloperPayments';

export interface DeveloperPaymentRow {
  id: string;
  serviceId: string;
  blueprintId: string;
  recipient: string;
  token: string;
  amount: string;
  paidAt: string;
  txHash: string;
}

export const mapDeveloperPaymentRow = (
  entry: DeveloperPaymentRow,
): DeveloperPaymentEvent => ({
  id: entry.id,
  serviceId: BigInt(entry.serviceId),
  blueprintId: BigInt(entry.blueprintId),
  recipient: parseAddressOrThrow(
    entry.recipient,
    `DeveloperPayment(${entry.id}).recipient`,
  ),
  token: parseAddressOrThrow(
    entry.token,
    `DeveloperPayment(${entry.id}).token`,
  ),
  amount: BigInt(entry.amount),
  paidAt: BigInt(entry.paidAt),
  txHash: entry.txHash,
});
