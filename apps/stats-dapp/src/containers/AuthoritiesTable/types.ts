import { KeyGenAuthority } from '../../provider/hooks';

export interface AuthoritiesTableProps {
  /**
   * The data property to display the table. If it's empty, the table will use the the server side data
   */
  data?: KeyGenAuthority[];
}
