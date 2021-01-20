import { useMemo, useState, useEffect } from 'react';
import { switchMap, map } from 'rxjs/operators';
import { combineLatest, Observable, of } from 'rxjs';

import { Vec, Option } from '@polkadot/types';
import { AccountId } from '@acala-network/types/interfaces/types';
import { Proposal, Hash, Votes } from '@polkadot/types/interfaces';
import { ApiRx } from '@polkadot/api';

import { useApi } from './useApi';
import { useCall } from './useCall';

export interface ProposalData {
  proposal: Proposal;
  vote: Votes;
  hash: string;
  council: string;
}

function getAllCouncil (api: ApiRx): string[] {
  return Object.keys(api.query).filter((key: string): boolean => key.endsWith('Council'));
}

function fetchProposalAndVote (api: ApiRx, council: string, hash: string): Observable<ProposalData> {
  return combineLatest(
    api.query[council].proposalOf<Option<Proposal>>(hash),
    api.query[council].voting<Option<Votes>>(hash)
  ).pipe(
    map(([proposal, vote]) => {
      return {
        council,
        hash: hash,
        proposal: proposal.unwrap(),
        vote: vote.unwrap()
      };
    })
  );
}

function fetchAllProposalAndVote (api: ApiRx, council: string): Observable<ProposalData[]> {
  return api.query[council].proposals<Vec<Hash>>().pipe(
    switchMap((result) => {
      if (result.isEmpty) return of([]);

      return combineLatest(
        result.map((hash) => fetchProposalAndVote(api, council, hash.toString()))
      );
    })
  );
}

export const useCouncilList = (): string[] => {
  const { api } = useApi();

  return useMemo(() => {
    if (!api) return [];

    return getAllCouncil(api);
  }, [api]);
};

export const useCouncilMembers = (council: string): Vec<AccountId> | undefined => {
  const _council = council.endsWith('Council') ? council : council + 'Council';
  const members = useCall<Vec<AccountId>>(`query.${_council}.members`, []);

  return members;
};

export const useProposal = (council: string, hash: string): ProposalData | null => {
  const _council = council.endsWith('Council') ? council : council + 'Council';
  const { api } = useApi();
  const [data, setData] = useState<ProposalData | null>(null);

  useEffect(() => {
    if (!api || !api.query[_council]) return;

    console.log(_council, hash);

    const subscriber = fetchProposalAndVote(api, _council, hash)
      .subscribe((data) => setData(data));

    return (): void => subscriber.unsubscribe();
  }, [api, _council, hash]);

  return data;
};

export const useProposals = (council: string): ProposalData[] => {
  const _council = council.endsWith('Council') ? council : council + 'Council';
  const { api } = useApi();
  const [data, setData] = useState<ProposalData[]>([]);

  useEffect(() => {
    if (!api || !api.query[_council]) return;

    const subscriber = fetchAllProposalAndVote(api, _council)
      .subscribe((data) => setData(data));

    return (): void => subscriber.unsubscribe();
  }, [api, _council]);

  return data;
};

export const useRecentProposals = (): ProposalData[] => {
  const { api } = useApi();
  const [data, setData] = useState<ProposalData[]>([]);

  useEffect(() => {
    if (!api) return;

    const councils = getAllCouncil(api);

    const subscriber = combineLatest(
      councils.map((item) => fetchAllProposalAndVote(api, item))
    ).subscribe((result) => {
      const _data = result
        .reduce((acc, cur): ProposalData[] => [...acc, ...cur], [])
        .sort((a, b) => a.vote.end.toNumber() - b.vote.end.toNumber())
        .slice(0, 4);

      setData(_data);
    });

    return (): void => subscriber.unsubscribe();
  }, [api]);

  return data;
};
