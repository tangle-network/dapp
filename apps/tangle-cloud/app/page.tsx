'use client';

import React from 'react';
import { Server, Box, Activity, Layers, Code, Settings, Play } from 'lucide-react';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import RestakeBanner from '@webb-tools/tangle-shared-ui/components/blueprints/RestakeBanner';
import { BLUEPRINT_DOCS_LINK } from '@webb-tools/webb-ui-components/constants/tangleDocs';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { 
  ShieldCheck, // for ISM
  ArrowRightLeft, // for Relayer
  LineChart,
  CirclePlus, // for new instance
  UserPlus, // for operator registration
} from 'lucide-react';
import Header from '../components/Header';
import { useAccount } from 'wagmi';
import { WalletLineIcon } from '@webb-tools/icons';
import ConnectWalletButton from '@webb-tools/tangle-shared-ui/components/ConnectWalletButton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@webb-tools/webb-ui-components/components/tabs';

const TangleCloudDashboard = () => {
  const { isConnected } = useAccount();
  
  // Debug log
  console.log('Wallet connection status:', isConnected);

  return (
    <div className="max-w-screen-xl px-4 mx-auto space-y-2 md:px-8 lg:px-10">
      <Header />

      <div className="p-6">
        {/* Welcome Banner */}
        <RestakeBanner
          title="Welcome to Tangle Cloud"
          description="Learn how to set up and manage decentralized services."
          buttonHref={BLUEPRINT_DOCS_LINK}
          buttonText="Get Started"
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="p-4 rounded-lg border border-mono-160 bg-glass_dark">
            <div className="flex items-center mb-2">
              <Box className="w-5 h-5 mr-2 text-purple-DEFAULT" />
              <Typography variant="body2" fw="medium">Active Blueprints</Typography>
            </div>
            <Typography variant="h4" fw="bold">3</Typography>
          </div>

          <div className="p-4 rounded-lg border border-mono-160 bg-glass_dark">
            <div className="flex items-center mb-2">
              <Server className="w-5 h-5 mr-2 text-purple-DEFAULT" />
              <Typography variant="body2" fw="medium">Registered Operators</Typography>
            </div>
            <Typography variant="h4" fw="bold">24</Typography>
          </div>

          <div className="p-4 rounded-lg border border-mono-160 bg-glass_dark">
            <div className="flex items-center mb-2">
              <Activity className="w-5 h-5 mr-2 text-purple-DEFAULT" />
              <Typography variant="body2" fw="medium">Active Instances</Typography>
            </div>
            <Typography variant="h4" fw="bold">8</Typography>
          </div>

          <div className="p-4 rounded-lg border border-mono-160 bg-glass_dark">
            <div className="flex items-center mb-2">
              <Layers className="w-5 h-5 mr-2 text-purple-DEFAULT" />
              <Typography variant="body2" fw="medium">Total Jobs Executed</Typography>
            </div>
            <Typography variant="h4" fw="bold">156</Typography>
          </div>
        </div>

        {/* Blueprint Status Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="p-6 rounded-lg border border-mono-160 bg-glass_dark">
            <Typography variant="h4" fw="bold" className="mb-4">
              Active Blueprints
            </Typography>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded bg-mono-180">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-mono-170">
                    <ShieldCheck className="w-5 h-5 text-purple-DEFAULT" />
                  </div>
                  <div>
                    <Typography variant="body2" fw="medium">Hyperlane ISM</Typography>
                    <Typography variant="body3" className="text-mono-120">
                      Cross-chain message verification
                    </Typography>
                  </div>
                </div>
                <div className="text-right">
                  <Typography variant="body2" fw="medium">12 Operators</Typography>
                  <Typography variant="body3" className="text-mono-120">
                    3 Active Instances
                  </Typography>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded bg-mono-180">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-mono-170">
                    <ArrowRightLeft className="w-5 h-5 text-purple-DEFAULT" />
                  </div>
                  <div>
                    <Typography variant="body2" fw="medium">Hyperlane Relayer</Typography>
                    <Typography variant="body3" className="text-mono-120">
                      Message relaying service
                    </Typography>
                  </div>
                </div>
                <div className="text-right">
                  <Typography variant="body2" fw="medium">8 Operators</Typography>
                  <Typography variant="body3" className="text-mono-120">
                    4 Active Instances
                  </Typography>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded bg-mono-180">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-mono-170">
                    <LineChart className="w-5 h-5 text-purple-DEFAULT" />
                  </div>
                  <div>
                    <Typography variant="body2" fw="medium">Oracle Network</Typography>
                    <Typography variant="body3" className="text-mono-120">
                      Price feed oracle service
                    </Typography>
                  </div>
                </div>
                <div className="text-right">
                  <Typography variant="body2" fw="medium">4 Operators</Typography>
                  <Typography variant="body3" className="text-mono-120">
                    1 Active Instance
                  </Typography>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Link href="/blueprints">
                <Button
                  variant="link"
                  size="sm"
                  rightIcon={<ArrowRightIcon />}
                >
                  View All
                </Button>
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-lg border border-mono-160 bg-glass_dark">
            <Typography variant="h4" fw="bold" className="mb-4">
              Recent Activity
            </Typography>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 rounded bg-mono-180">
                <div className="p-2 rounded-full bg-mono-170">
                  <CirclePlus className="w-5 h-5 text-green-50" />
                </div>
                <div>
                  <Typography variant="body2">
                    New instance deployed for Hyperlane ISM
                  </Typography>
                  <Typography variant="body4" className="text-mono-120">
                    10 minutes ago
                  </Typography>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded bg-mono-180">
                <div className="p-2 rounded-full bg-mono-170">
                  <UserPlus className="w-5 h-5 text-blue-50" />
                </div>
                <div>
                  <Typography variant="body2">
                    Operator registered for Hyperlane Relayer
                  </Typography>
                  <Typography variant="body4" className="text-mono-120">
                    2 hours ago
                  </Typography>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded bg-mono-180">
                <div className="p-2 rounded-full bg-mono-170">
                  <Play className="w-5 h-5 text-purple-DEFAULT" />
                </div>
                <div>
                  <Typography variant="body2">
                    New job executed on Oracle Network instance
                  </Typography>
                  <Typography variant="body4" className="text-mono-120">
                    5 hours ago
                  </Typography>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                variant="link"
                size="sm"
                rightIcon={<ArrowRightIcon />}
              >
                View All
              </Button>
            </div>
          </div>
        </div>

        {/* My Account Section */}
        <div className="mt-8">
          {isConnected ? (
            <div className="p-6 rounded-lg border border-mono-160 bg-glass_dark">
              <Typography variant="h4" fw="bold" className="mb-6">
                My Account
              </Typography>

              <Tabs defaultValue="blueprints" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="blueprints" className="flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    My Blueprints
                  </TabsTrigger>
                  <TabsTrigger value="services" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Operating Services
                  </TabsTrigger>
                  <TabsTrigger value="instances" className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Deployed Instances
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="blueprints">
                  <div className="space-y-3">
                    <div className="p-4 rounded bg-mono-180">
                      <div className="flex items-center justify-between mb-1">
                        <Typography variant="body1" fw="medium">Custom Oracle Network</Typography>
                        <span className="px-2 py-1 text-xs rounded bg-green-50/10 text-green-50">Live</span>
                      </div>
                      <Typography variant="body2" className="text-mono-100">2 Active Instances</Typography>
                    </div>
                    <div className="p-4 rounded bg-mono-180">
                      <div className="flex items-center justify-between mb-1">
                        <Typography variant="body1" fw="medium">Message Validator</Typography>
                        <span className="px-2 py-1 text-xs rounded bg-yellow-50/10 text-yellow-50">Draft</span>
                      </div>
                      <Typography variant="body2" className="text-mono-100">In Development</Typography>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="services">
                  <div className="space-y-3">
                    <div className="p-4 rounded bg-mono-180">
                      <div className="flex items-center justify-between mb-1">
                        <Typography variant="body1" fw="medium">Hyperlane ISM</Typography>
                        <span className="px-2 py-1 text-xs rounded bg-blue-50/10 text-blue-50">Active</span>
                      </div>
                      <Typography variant="body2" className="text-mono-100">Uptime: 99.9%</Typography>
                    </div>
                    <div className="p-4 rounded bg-mono-180">
                      <div className="flex items-center justify-between mb-1">
                        <Typography variant="body1" fw="medium">Hyperlane Relayer</Typography>
                        <span className="px-2 py-1 text-xs rounded bg-blue-50/10 text-blue-50">Active</span>
                      </div>
                      <Typography variant="body2" className="text-mono-100">Uptime: 99.8%</Typography>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="instances">
                  <div className="space-y-3">
                    <div className="p-4 rounded bg-mono-180">
                      <div className="flex items-center justify-between mb-1">
                        <Typography variant="body1" fw="medium">Hyperlane ISM #1</Typography>
                        <span className="px-2 py-1 text-xs rounded bg-green-50/10 text-green-50">Running</span>
                      </div>
                      <Typography variant="body2" className="text-mono-100">4 Operators</Typography>
                    </div>
                    <div className="p-4 rounded bg-mono-180">
                      <div className="flex items-center justify-between mb-1">
                        <Typography variant="body1" fw="medium">Oracle Network #2</Typography>
                        <span className="px-2 py-1 text-xs rounded bg-green-50/10 text-green-50">Running</span>
                      </div>
                      <Typography variant="body2" className="text-mono-100">3 Operators</Typography>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="p-12 rounded-lg border border-mono-160 bg-glass_dark">
              <div className="text-center max-w-lg mx-auto">
                <Typography variant="h4" fw="bold" className="mb-3">
                  My Account
                </Typography>
                
                <Typography variant="body1" className="text-mono-120 mb-8">
                  Connect your wallet to view your activities across blueprints, operations, and deployments
                </Typography>

                <ConnectWalletButton size="lg" />
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Typography variant="h4" fw="bold" className="mb-4">
            Quick Actions
          </Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-mono-160 rounded-lg text-left bg-glass_dark hover:border-purple-DEFAULT transition-colors">
              <Typography variant="body2" fw="medium" className="mb-1">
                Deploy Service
              </Typography>
              <Typography variant="body3" className="text-mono-120">
                Launch a new Blueprint instance
              </Typography>
            </button>

            <button className="p-4 border border-mono-160 rounded-lg text-left bg-glass_dark hover:border-purple-DEFAULT transition-colors">
              <Typography variant="body2" fw="medium" className="mb-1">
                Register as Operator
              </Typography>
              <Typography variant="body3" className="text-mono-120">
                Run Blueprint services
              </Typography>
            </button>

            <button className="p-4 border border-mono-160 rounded-lg text-left bg-glass_dark hover:border-purple-DEFAULT transition-colors">
              <Typography variant="body2" fw="medium" className="mb-1">
                Create Blueprint
              </Typography>
              <Typography variant="body3" className="text-mono-120">
                Build new service template
              </Typography>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TangleCloudDashboard;
