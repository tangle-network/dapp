import { Post, Video } from '../../libs/notion';
import { Heading3, SubHeading1 } from '../../components';
import Link from 'next/link';
import { ExternalLinkIcon } from '@radix-ui/react-icons';
import { Button } from '@webb-tools/webb-ui-components';

type FeaturedPostSectionProps = {
  featuredPost: Post;
  recentVideos: Video[];
};

export const FeaturedPostSection = ({
  featuredPost: {
    metadata: { title, cover, slug, description, link, type },
  },
  recentVideos,
}: FeaturedPostSectionProps) => {
  return (
    <div className="px-4 mt-[18px] grid lg:grid-cols-2 gap-x-6 gap-y-[72px] py-[72px]">
      {/* Featured Post */}
      <div className="break-words rounded-lg shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
        <Link href={link ? link : `/blog/posts/${slug}`}>
          <div
            style={{
              backgroundImage: `url(${cover})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            className="w-full h-[220px] md:h-[250px] rounded-t-lg"
          />
        </Link>
        <div className="px-[24px] py-[16px]">
          <Link href={link ? link : `/blog/posts/${slug}`}>
            <Heading3 className="featured-post-title text-mono-200">
              {title}
            </Heading3>
          </Link>
          <SubHeading1 className="mt-2 featured-post-text text-mono-120">
            {description}
          </SubHeading1>
          <div className="flex justify-end">
            <Button
              variant="utility"
              href={link ? link : `/blog/posts/${slug}`}
              size="sm"
            >
              {type === 'post' ? 'Read More' : 'Read Paper'}
            </Button>
          </div>
        </div>
      </div>
      {/* Recent videos */}
      <div>
        <span className="card-tag text-mono-120">Featured</span>
        <ul>
          {recentVideos.map((video) => {
            const { id, title, link, tags } = video.metadata;

            return (
              <Link key={id} href={link} target="_blank" rel="noreferrer">
                <li className="border-b-2 border-mono-200 pb-6 mt-6">
                  <span className="recent-video-title text-mono-200 capitalize flex items-center gap-2">
                    {tags[0]}: {title}{' '}
                    <ExternalLinkIcon width={20} height={20} color="#1F1D2B" />
                  </span>
                </li>
              </Link>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
