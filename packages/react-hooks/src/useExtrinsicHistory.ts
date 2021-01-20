import { useEffect, useRef, useCallback, useState } from 'react';
import { Subject, interval } from 'rxjs';
import axios from 'axios';

interface QueryParams {
  method: string | string[];
  section: string;
  signer: string;
  [k: string]: string | string[];
}

export interface ExtrinsicHistoryData {
  hash: string;
  method: string;
  section: string;
  params: string[];
  signer: string;
  time: Date;
  success: boolean;
  addon?: any;
  blockNum: number;
  [k: string]: any;
}

function formatHistory (origin: any[]): ExtrinsicHistoryData[] {
  if (!origin) {
    return [];
  }

  return origin.map((item) => {
    let params = [];

    try {
      params = JSON.parse(item.params);
    } catch (_error) {
      // swallow error
    }

    return {
      blockNum: item.block_num,
      hash: item.extrinsic_hash,
      method: item.call_module_function,
      params: params.map((item: any) => item.value),
      section: item.call_module,
      signer: item.account_id,
      success: item.success,
      time: item.block_timestamp
    };
  });
}

interface Pagination {
  currentPage: number;
  total: number;
  pageSize: number;
}

interface HooksReturnType {
  data: ExtrinsicHistoryData[];
  loading: boolean;
  error: Error | undefined;
  refresh: (delay: number) => void;
  pagination: Pagination;
  onPaginationChagne: (data: Partial<Pagination>) => void;
}

let count = 0;

const refresh$ = new Subject();

// refresh every 30 seconds
interval(1000 * 30).subscribe(() => {
  refresh$.next(count++);
});

const SUBSCAN_TX = 'https://acala-testnet.subscan.io/api/scan/extrinsics';

export const useHistory = (query?: QueryParams): HooksReturnType => {
  const savedQuery = useRef<string>('');
  const paginationRef = useRef<Pagination>({
    currentPage: 0,
    pageSize: 5,
    total: 0
  });
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 0,
    pageSize: 5,
    total: 0
  });
  const [data, setData] = useState<ExtrinsicHistoryData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>();

  const fetch = useCallback((pagination: Pagination) => {
    setLoading(true);

    const url = SUBSCAN_TX;

    if (!query || !query.section) {
      return;
    }

    axios.post(url, {
      address: query.signer,
      call: query.method,
      module: query.section,
      page: pagination.currentPage,
      row: pagination.pageSize
    }).then((result) => {
      if (result.status === 200 && result.data.code === 0) {
        setData(formatHistory(result?.data?.data?.extrinsics));
        paginationRef.current.total = result?.data?.data?.count;
        setPagination({ ...paginationRef.current });
      }
    }).catch((error) => {
      // reset ref
      paginationRef.current = { ...pagination };
      setError(error);
    }).finally(() => {
      setLoading(false);
    });
  }, [query]);

  useEffect(() => {
    const subscribe = refresh$.subscribe(() => {
      fetch(paginationRef.current);
    });

    return (): void => subscribe.unsubscribe();
  }, [fetch]);

  useEffect(() => {
    if (!query) {
      return;
    }

    if (savedQuery.current !== JSON.stringify(query)) {
      fetch(paginationRef.current);
      savedQuery.current = JSON.stringify(query);
    }
  }, [fetch, query]);

  const onPaginationChagne = useCallback((data: Partial<Pagination>) => {
    paginationRef.current = {
      ...paginationRef.current,
      ...data
    };

    fetch(paginationRef.current);
  }, [fetch]);

  const refresh = useCallback((delay = 0) => {
    setTimeout(() => {
      refresh$.next(count++);
    }, delay);
  }, []);

  return {
    data,
    error,
    loading,
    onPaginationChagne,
    pagination,
    refresh
  };
};
