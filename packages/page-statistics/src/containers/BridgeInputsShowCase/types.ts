import { useState } from 'react';

export interface ShowcaseProps {
  fixedAmountState: ReturnType<typeof useState<number>>;
  recipientState: ReturnType<typeof useState<string>>;
}
