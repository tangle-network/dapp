import { ComponentBase } from '../../types';
export interface TokenPairProps extends ComponentBase {
    /**
     * The pool name
     */
    name?: string;
    /**
     * The first token symbol
     */
    token1Symbol: string;
    /**
     * The second token symbol
     */
    token2Symbol: string;
    /**
     * The user's balance
     */
    balance?: number;
}
