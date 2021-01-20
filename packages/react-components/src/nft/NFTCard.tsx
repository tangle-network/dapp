import React, { FC } from 'react';
import { styled } from '@webb-dapp/ui-components';
import { BareProps } from '@webb-dapp/ui-components/types';
import nftPeopleIcon from '../assets/nft-people-icon.svg';

const NFTCardRoot: FC<{ onClick?: () => void }> = styled.div<{ onClick: () => void }>`
  cursor: pointer;
`;

export const NFTImage = styled(({ className, src }) => {
  return (
    <div className={className}>
      <img src={src} />
    </div>
  );
})`
  width: 325px;
  height: 325px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.16);
  border-radius: 16px;

  > img {
    width: 100%;
    height: 100%;
    border-radius: 16px;
    padding: 6px;
  }
`;

const NFTName = styled.div`
  font-size: 16px;
  line-height: 1.1876;
  color: var(--text-color-primary);
`;

const PeopleRoot = styled.div`
  position: relative;
  padding: 0 0 0 35px;
  font-size: 14px;
  line-height: 1.357142;
`;

const PeopleType = styled.p`
  color: var(--text-color-second);
`;

const PeopleName = styled.p`
  margin-top: 5px;
  color: var(--text-color-primary);
`;

const PeopleAvatar = styled.img`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  object-fit: contain;
`;

interface PeopleProps {
  type: 'publisher' | 'artist';
  name: string;
  avatar: string;
}

const NFTPeople: FC<PeopleProps> = ({ avatar, name, type }) => {
  return (
    <PeopleRoot>
      <PeopleType>{type === 'publisher' ? 'PUBLISHER' : 'ARTIST'}</PeopleType>
      <PeopleName>{name}</PeopleName>
      <PeopleAvatar src={avatar || nftPeopleIcon} />
    </PeopleRoot>
  );
};

const NFTPeopleContainer = styled.div`
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  margin-left: -35px;
`;

interface NFTCardProps {
  name?: string; // NFT name
  externalUrl?: string; // NFT resource url
  publisher?: string;
  artist?: string;
  onClick?: () => void;
}

const NFTInfo = styled<FC<BareProps & NFTCardProps>>(({ artist, className, name, publisher }) => {
  return (
    <div className={className}>
      <NFTName>{name}</NFTName>
      <NFTPeopleContainer>
        <NFTPeople avatar='' name={publisher || 'Acala'} type='publisher' />
        {artist ? <NFTPeople avatar='' name={artist} type='artist' /> : null}
      </NFTPeopleContainer>
    </div>
  );
})`
  padding: 16px 0 0 34px;
`;

export const NFTCard: FC<NFTCardProps> = ({ externalUrl, name, onClick }) => {
  return (
    <NFTCardRoot onClick={onClick}>
      <NFTImage src={externalUrl} />
      <NFTInfo name={name} />
    </NFTCardRoot>
  );
};
