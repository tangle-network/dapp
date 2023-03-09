import Link from 'next/link';
import Image from 'next/image';
import { Heading3 } from './Heading3';
import { Chip } from '@webb-tools/webb-ui-components';
import { getYouTubeThumbnailUri } from '../utils';

type BlogCardProps = {
  title: string;
  cover: string;
  tags: string[];
  link: string;
  blogType?: string;
  type: 'post' | 'video';
};

export const BlogCard = ({
  title,
  tags,
  cover,
  type,
  link,
  blogType,
}: BlogCardProps) => {
  const coverURI =
    type === 'video' ? getYouTubeThumbnailUri(link) ?? cover : cover;

  return (
    <div className="flex flex-col justify-between pb-5 break-words rounded-lg shadow-[0_4px_4px_rgba(0,0,0,0.25)] xl:w-[384px]">
      <div>
        <Link href={link}>
          <div
            style={{
              backgroundImage: `url(${coverURI})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            className="w-full h-[220px] md:h-[250px] rounded-t-lg relative"
          >
            {type === 'video' && (
              <Image
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                src={`/static/svgs/play-button.svg`}
                alt="Play button"
                width="100"
                height="100"
              />
            )}
          </div>
        </Link>
        <div className="mt-4 mb-3 px-6">
          {tags && (
            <div className="flex items-center gap-4 capitalize">
              {tags.map((tag) => (
                <span key={tag} className="card-tag text-mono-120">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <Link href={link}>
            <Heading3 className="card-title mt-2 text-mono-200">
              {title}
            </Heading3>
          </Link>
        </div>
      </div>
      {type === 'post' && blogType && (
        <Chip color="blue" className="mx-6 w-fit">
          {blogType}
        </Chip>
      )}
    </div>
  );
};
