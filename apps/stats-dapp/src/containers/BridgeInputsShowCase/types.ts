import { useState } from 'react';

export interface ShowcaseProps {
  fixedAmountState: ReturnType<typeof useState>;
  recipientState: ReturnType<typeof useState>;
}
