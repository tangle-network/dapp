import { Typography } from '@webb-tools/webb-ui-components';
import Image from 'next/image';
import { HeaderControls } from '../components/HeaderControls';
import { HomepageInteractiveContents } from '../components/HomepageInteractiveContents';
import { OverlayMask } from '../components/OverlayMask';

export default function Index() {
  return (
    <main className="flex flex-col gap-6">
      {/* Custom, landing-page-only header */}
      <header className="relative pb-12 bg-cover bg-center rounded-b-xl overflow-hidden">
        {/* Background image, this is method preferred because of Next.js' image optimization */}
        <Image
          className="absolute inset-0 w-full h-full object-cover object-center"
          src="/header-bg.jpg"
          width={1210}
          height={300}
          alt="A colorful vector illustration of blocks"
        />

        {/* Background image mask */}
        <OverlayMask opacity={0.2} />

        <div className="relative flex flex-col items-end my-4 px-4">
          <HeaderControls doHideSearchBar />
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

      <HomepageInteractiveContents />
    </main>
  );
}
