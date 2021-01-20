import { ReactNode } from 'react';

export interface BareProps {
  children?: ReactNode;
  className?: string;
}

export interface ClickAbleProps {
  onClick: () => void;
}

export type MessageType = 'success' | 'info' | 'warning' | 'error';

export type Style = 'normal' | 'primary' | 'warning' | 'error';
