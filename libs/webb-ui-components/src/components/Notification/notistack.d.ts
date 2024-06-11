import type { SnackbarProvider as SnackbarProviderBase } from 'notistack';
import type { ReactNode } from 'react';

declare module 'notistack' {
  export interface SnackbarProvider extends SnackbarProviderBase {
    render(): ReactNode;
  }
}
