import { ChainGroup } from '../../../../dapp-config/src/chains/chain-config.interface';
import { ReactNode } from '../../../../../node_modules/react';
import { ComponentBase } from '../../types';
export type ChainChipClassNames = {
    [key in ChainGroup]: {
        default: string;
    };
};
export interface ChainChipProps extends ComponentBase {
    chainType: ChainGroup;
    chainName: string;
    title?: string;
    children?: ReactNode;
}
