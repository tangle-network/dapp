import { Validator } from '../../types';

export interface ValidatorTableProps {
  data: Validator[];
  pageSize: number;
  pageIndex: number;
  totalRecordCount: number;
  setPageIndex: (pageIndex: number) => void;
}
