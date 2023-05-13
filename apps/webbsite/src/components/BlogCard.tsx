import { Chip, Typography } from '@webb-tools/webb-ui-components';
import Image from 'next/image';
import Link from 'next/link';
import { getYouTubeThumbnailUri } from '../utils';

type BlogCardProps = {
  title: string;
  cover: string;
  tag: string;
  link: string;
  postType?: string;
  type: 'post' | 'video';
};

export const BlogCard = ({
  title,
  tag,
  cover,
  type,
  link,
  postType,
}: BlogCardProps) => {
  const coverURI =
    type === 'video' ? getYouTubeThumbnailUri(link) ?? cover : cover;

  return (
    <div className="flex flex-col justify-between pb-5 break-words rounded-lg shadow-[0_4px_4px_rgba(0,0,0,0.25)] xl:w-[384px] overflow-hidden">
      <div>
        <Link
          href={link}
          className="w-full h-[220px] md:h-[250px] overflow-hidden block"
        >
          <div
            style={{
              backgroundImage: `url(${coverURI})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            className="w-full h-[220px] md:h-[250px] rounded-t-lg relative transition duration-500 transform hover:scale-110"
          >
            {type === 'video' && (
              <Image
                className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
                src={`/static/svgs/play-button.svg`}
                alt="Play button"
                width="100"
                height="100"
              />
            )}
          </div>
        </Link>
        <div className="px-6 mt-4 mb-3">
          {tag && (
            <div className="flex items-center gap-4 capitalize">
              <span key={tag} className="card-tag text-mono-120">
                {tag}
              </span>
            </div>
          )}
          <Link href={link}>
            <Typography
              variant="mkt-h3"
              className="mt-2 card-title text-mono-200"
            >
              {title}
            </Typography>
          </Link>
        </div>
      </div>
      {type === 'post' && postType && (
        <div className="flex justify-end px-6">
          <Chip color="blue" className="w-fit">
            {postType}
          </Chip>
        </div>
      )}
    </div>
  );
};
