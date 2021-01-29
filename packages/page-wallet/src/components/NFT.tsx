import React, { FC, useCallback, useMemo, useState } from 'react';

import { TokenInfoOf, ClassInfoOf } from '@webb-tools/types/interfaces';
import { Card, GridBox, Empty, CardLoading, Modal, styled } from '@webb-dapp/ui-components';
import { NFTCard, NFTImage } from '@webb-dapp/react-components';
import { useAllNFTTokens, useModal } from '@webb-dapp/react-hooks';

type NewTokenInfo = Omit<TokenInfoOf, 'metadata'> & { metadata: Record<string, string> };

const CNFTImage = styled(NFTImage)`
  width: 100%;
  height: 100%;
`;

export const NFT: FC = () => {
  const { data, loading } = useAllNFTTokens();
  const [activeImg, setActiveImg] = useState<{ name: string; externalUrl: string }>();
  const { close: closeActiveNFTModal, open: openActiveNFTModal, status: activeNFTModalStatus } = useModal();

  const _data = useMemo(() => {
    if (loading) return [];

    return data
      .map(([classes, token]) => {
        try {
          JSON.parse(token.metadata.toUtf8());

          return [classes, token];
        } catch (e) {
          // swallow error
        }

        return null;
        /* eslint-disable-next-line */
      })
      .filter((result) => {
        return !!result;
      })
      .map((data) => {
        /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
        const [classes, token] = data! as [ClassInfoOf, TokenInfoOf];

        const metadata = JSON.parse(token.metadata.toUtf8());

        return {
          artist: metadata?.artist,
          classes: {
            metadata: classes.metadata.toUtf8(),
            totalIssuance: classes.totalIssuance.toBn().toNumber(),
          },
          externalUrl: metadata?.external_url,
          name: metadata?.name,
          publisher: metadata?.publisher,
        };
      });
  }, [data, loading]);

  const handleNFTCardClick = useCallback(
    (item) => {
      setActiveImg(item);
      openActiveNFTModal();
    },
    [setActiveImg, openActiveNFTModal]
  );

  if (loading) return <CardLoading />;

  if (!_data.length && !loading) return <Empty title='No NFT' />;

  return (
    <>
      <Modal
        footer={null}
        onCancel={closeActiveNFTModal}
        title={activeImg?.name}
        visible={activeNFTModalStatus}
        width={960}
      >
        <CNFTImage src={activeImg?.externalUrl} />
      </Modal>
      <Card showShadow={false}>
        <GridBox column={3} padding={32} row={'auto'}>
          {_data.map(
            (data, index): JSX.Element => {
              return (
                <div key={`nft-${data.classes.metadata}-${data.name}-${index}`}>
                  <NFTCard
                    artist={data.artist}
                    externalUrl={data.externalUrl}
                    name={data.name}
                    onClick={(): void => handleNFTCardClick(data)}
                    publisher={data.publisher}
                  />
                </div>
              );
            }
          )}
        </GridBox>
      </Card>
    </>
  );
};
