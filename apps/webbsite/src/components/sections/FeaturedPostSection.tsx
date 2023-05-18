import Link from 'next/link';
import { ExternalLinkIcon } from '@radix-ui/react-icons';
import { Button, Typography } from '@webb-tools/webb-ui-components';
import { Post, Video } from '../../libs/webb-cms';

type FeaturedPostSectionProps = {
  featuredPost: Post;
  recentVideos: Video[];
};

export const FeaturedPostSection = ({
  featuredPost: {
    title,
    thumbnailImage,
    id,
    description,
    linkToResearchPaper,
    postType,
  },
  recentVideos,
}: FeaturedPostSectionProps) => {
  return (
    <div className="px-4 mt-[18px] grid lg:grid-cols-2 gap-x-6 gap-y-[72px] py-[72px]">
      {/* Featured Post */}
      <div className="break-words rounded-lg shadow-[0_4px_4px_rgba(0,0,0,0.25)] overflow-hidden">
        <Link
          href={linkToResearchPaper ? linkToResearchPaper : `/blog/posts/${id}`}
          className="w-full h-[220px] md:h-[250px] overflow-hidden block"
        >
          <div
            style={{
              backgroundImage: `url(${thumbnailImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            className="w-full h-[220px] md:h-[360px] rounded-t-lg transition duration-500 transform hover:scale-110"
          />
        </Link>
        <div className="px-[24px] pt-[16px] pb-[20px]">
          <Link
            href={
              linkToResearchPaper ? linkToResearchPaper : `/blog/posts/${id}`
            }
          >
            <Typography
              variant="mkt-subheading"
              className=" text-mono-200 font-black"
            >
              {title}
            </Typography>
          </Link>
          <Typography
            variant="mkt-body1"
            className="mt-2  text-mono-120 font-medium"
          >
            {description}
          </Typography>
          <div className="flex justify-end mt-6">
            <Button
              variant="utility"
              href={
                linkToResearchPaper ? linkToResearchPaper : `/blog/posts/${id}`
              }
              size="sm"
            >
              {postType === 'Post' ? 'Read More' : 'Read Paper'}
            </Button>
          </div>
        </div>
      </div>
      {/* Recent videos */}
      <div>
        <Typography variant="mkt-small-caps" className="text-mono-120 font-black">
          Featured
        </Typography>
        <ul>
          {recentVideos.map(({ id, title, linkToVideo, tag }) => {
            return (
              <Link
                key={id}
                href={linkToVideo}
                target="_blank"
                rel="noreferrer"
              >
                <li className="pb-6 mt-6 border-b-2 border-mono-200">
                  <Typography
                    variant="mkt-subheading"
                    className="flex items-center gap-2 capitalize text-mono-200 font-black"
                  >
                    {tag}: {title}{' '}
                    <ExternalLinkIcon width={20} height={20} color="#1F1D2B" />
                  </Typography>
                </li>
              </Link>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
