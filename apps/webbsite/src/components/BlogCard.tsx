/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { Heading3 } from './Heading3';

type BlogCardProps = {
  title: string;
  tags?: string[];
  cover: string;
  link: string;
};

export const BlogCard = (data: BlogCardProps) => {
  const { title, tags, cover, link } = data;

  return (
    <div className="break-words rounded-lg shadow-[0_4px_4px_rgba(0,0,0,0.25)] xl:w-[384px]">
      <Link href={link}>
        <div
          style={{ backgroundImage: `url(${cover})`, backgroundSize: 'cover' }}
          className="w-full h-[220px] md:h-[250px] rounded-t-lg"
        />
      </Link>
      <div className="mt-4 mb-8 px-6 pb-8">
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
          <Heading3 className="card-title mt-2 text-mono-200">{title}</Heading3>
        </Link>
      </div>
    </div>
  );
};
