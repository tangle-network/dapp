import { BridgeLabel, TransactionItem } from "@webb-dapp/webb-ui-components/containers/TransactionProgressCard/types";
import { forwardRef, useMemo } from "react";

/**
 *
 * TransactionProgressCard
 * */
export const TransactionProgressCard = forwardRef<HTMLDivElement, TransactionItem>(({ label, ...props }, ref) => {
  const labelVariant = useMemo(() => ((label as BridgeLabel).tokenURI ? 'bridge' : 'native'), [label]);
  return <div {...props} ref={ref}></div>;
});
