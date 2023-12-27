import { Typography } from '@webb-tools/webb-ui-components';
import { HeaderActions } from '../components/HeaderActions';
import { Filters } from '../components/Filters/Filters';
import { ArrowUpIcon } from '@radix-ui/react-icons';
import { PageUrl } from '../utils/utils';
import { LinkCard } from '../components/LinkCard';
import { HomepageSearchControls } from '../components/HomepageSearchControls';
import { HomepageItemGridContainer } from '../components/HomepageItemGridContainer';

export default function Index() {
  return (
    <main className="flex flex-col gap-6">
      {/* Custom, landing-page-only header */}
      {/* TODO: Need to figure out a way to significantly reduce the size of the background image (it's 1mb right now). Should be <=100kb for optimal SEO. One way would be to trim it to what is actually used in terms of max proportions visible to the user, or reduce its resolution. */}
      <header
        className="relative pb-12 bg-cover bg-center rounded-b-xl"
        style={{ backgroundImage: 'url(/header-bg.png)' }}
      >
        {/* Background image mask */}
        <div className="absolute inset-0 opacity-20 bg-black"></div>

        <div className="relative flex flex-col items-end my-4 px-4">
          <HeaderActions doHideSearchBar />
        </div>

        <div className="relative space-y-4 px-5">
          <Typography
            variant="body4"
            className="uppercase text-mono-0 dark:text-mono-0"
            fw="bold"
          >
            Privacy for everyone, everything, everywhere
          </Typography>

          <Typography variant="h2" fw="bold" className="text-mono-0">
            Zero-Knowledge Explorer
          </Typography>

          <Typography variant="h5" fw="normal" className="text-mono-0">
            Dive into the future of privacy with advanced cryptography &
            zero-knowledge proofs.
          </Typography>
        </div>
      </header>

      <HomepageSearchControls />

      {/* Content: Filters & grid items */}
      <div className="flex flex-col sm:flex-row gap-0 sm:gap-6">
        <div className="pl-6 max-w-[317px] space-y-12">
          <Filters className="hidden sm:flex" />

          <LinkCard className="hidden sm:block" href={PageUrl.SubmitProject}>
            <div className="p-2 bg-mono-60 dark:bg-mono-120 rounded-full mb-6">
              <ArrowUpIcon className="w-6 h-6 fill-mono-0" />
            </div>

            <Typography
              variant="body1"
              fw="bold"
              className="mb-1 dark:text-mono-0"
            >
              Submit Project!
            </Typography>

            <Typography
              variant="body1"
              fw="normal"
              className="dark:text-mono-100"
            >
              Have a zero-knowledge project you&apos;d like to share with the
              community?
            </Typography>
          </LinkCard>
        </div>

        <HomepageItemGridContainer />
      </div>
    </main>
  );
}
