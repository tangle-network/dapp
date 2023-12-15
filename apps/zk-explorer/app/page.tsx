import { Typography, Button, Input } from '@webb-tools/webb-ui-components';
import { HeaderActions } from '../components/HeaderActions';
import { Search } from '@webb-tools/icons';
import { FilteringSidebar } from '../components/FilteringSidebar';

export default function Index() {
  return (
    <main className="flex flex-col gap-6">
      {/* Custom, landing-page-only header */}
      {/* TODO: Need to figure out a way to significantly reduce the size of the background image (it's 1mb right now). Should be <=100kb for optimal SEO. One way would be to trim it to what is actually used in terms of max proportions visible to the user, or reduce its resolution. */}
      <header
        className="relative pb-12 bg-cover bg-center rounded-b-xl mb-6"
        style={{ backgroundImage: 'url(/header-bg.png)' }}
      >
        {/* Background image mask */}
        <div className="absolute inset-0 opacity-20 bg-black"></div>

        <div className="relative flex items-end my-4 z-10">
          <HeaderActions />
        </div>

        <div className="relative space-y-4 px-5 z-10">
          <Typography variant="body4" className="uppercase">
            Privacy for everyone, everything, everywhere
          </Typography>
          <Typography variant="h2" fw="bold">
            Zero-Knowledge Explorer
          </Typography>
          <Typography variant="h5" fw="normal">
            Dive into the future of privacy with advanced cryptography &
            zero-knowledge proofs.
          </Typography>
        </div>
      </header>

      <div className="shadow-m py-4 px-6 dark:bg-mono-170 rounded-xl flex gap-2">
        <Button variant="primary" className="px-3">
          Projects
        </Button>

        <Button
          variant="primary"
          className="px-3 dark:bg-transparent border-none dark:text-mono-0"
        >
          Circuits
        </Button>

        <Input
          id="keyword search"
          rightIcon={<Search size="lg" />}
          className="w-full"
          placeholder="search for keyword"
        />
      </div>

      <FilteringSidebar />
    </main>
  );
}
