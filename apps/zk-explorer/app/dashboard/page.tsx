'use client';

import {
  Avatar,
  Button,
  Card,
  Typography,
} from '@webb-tools/webb-ui-components';
import { Header } from '../../components/Header';
import { Tabs } from '../../components/Tabs';
import { VerticalDivider } from '../../components/VerticalDivider';

export default function Dashboard() {
  return (
    <main className="flex flex-col gap-6">
      <Header />

      <Tabs
        tabs={[{ name: 'Overview' }, { name: 'Settings' }, { name: 'Billing' }]}
      >
        {/* Overview */}
        <Tabs.Content>
          <div className="flex flex-col gap-6">
            <Card className="p-6 flex rounded-2xl">
              <div className="flex">
                <div className="flex flex-col justify-center gap-1">
                  <Typography variant="body2" fw="normal">
                    Activated Circuits
                  </Typography>

                  <Typography variant="h5" fw="bold">
                    -
                  </Typography>
                </div>

                <VerticalDivider />

                <div className="flex flex-col justify-center gap-1">
                  <Typography variant="body2" fw="normal">
                    Member Since
                  </Typography>

                  <Typography variant="h5" fw="bold">
                    Dec 11, 2023
                  </Typography>
                </div>

                <VerticalDivider />

                <div className="flex flex-col justify-center gap-1">
                  <Typography variant="body2" fw="normal">
                    Links
                  </Typography>

                  <Typography variant="h5" fw="bold">
                    Dec 11, 2023
                  </Typography>
                </div>

                <VerticalDivider />

                <div className="flex flex-col justify-center gap-1">
                  <Typography variant="body2" fw="normal">
                    Short Bio
                  </Typography>

                  <Typography variant="h5" fw="bold">
                    -
                  </Typography>
                </div>

                {/* TODO: Temporary avatar image URL. */}
                <Avatar
                  className="flex ml-auto rounded-2xl dark:bg-mono-190 w-24 h-24"
                  size="lg"
                  src="./avatar.png"
                />
              </div>
            </Card>

            <Card className="p-6 flex gap-4 rounded-2xl">
              <Typography variant="h5" fw="bold">
                Proof Generations
              </Typography>

              <div className="flex flex-col items-center gap-3 py-12 mx-auto">
                <Typography variant="h5" fw="bold" className="text-center">
                  🔍
                  <br /> Coming Soon!
                </Typography>

                <Typography
                  variant="body2"
                  fw="normal"
                  className="text-center max-w-[712px]"
                >
                  Get ready to unlock the full potential of your ZK circuits!
                  Our ZK services are on the horizon, designed to seamlessly
                  create and manage zero-knowledge proofs with unparalleled
                  efficiency.
                </Typography>

                <Button variant="secondary" href="#">
                  Learn More
                </Button>
              </div>
            </Card>
          </div>
        </Tabs.Content>

        {/* Settings */}
        <Tabs.Content>second</Tabs.Content>

        {/* Billing */}
        <Tabs.Content>third</Tabs.Content>
      </Tabs>
    </main>
  );
}
