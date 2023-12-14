import { Breadcrumbs, BreadcrumbsItem, Button, Input, Card, TitleWithInfo, Footer, WalletButton, Typography, IconButton, Dropdown, DropdownBasicButton, DropdownMenu, DropdownBody, DropdownButton, MenuItem } from '@webb-tools/webb-ui-components';
import { ArrowRightUp, MetaMaskIcon, Search, ThreeDotsVerticalIcon, CheckboxBlankCircleLine, ExternalLinkLine } from '@webb-tools/icons';
import { WalletConfig } from '@webb-tools/dapp-config';

export default async function Index() {
  return (
    <main className="space-y-6 flex flex-col">
      <div className="flex flex-col gap-6">
        <Typography variant="h4" fw="bold">
          Upload Project
        </Typography>

        <div className="flex gap-6 mb-auto">
          <Card className="">
            <Typography variant="h5" className="text-mono-0">
              1. GitHub Repository URL:
            </Typography>

            <Input
              id="repository url"
              autoFocus
              placeholder="https://github.com/username/repository-name"
            />

            <div className="flex space-x-4">
              <Button variant="secondary" isFullWidth>Learn More</Button>
              <Button isDisabled isFullWidth>Submit Project</Button>
            </div>
          </Card>

          <div>
            <Card className="p-6">
              <div>
                <TitleWithInfo title="Feedback" variant="h5" />
                <Typography variant="h5" className="text-mono-100">
                  Have feedback? Reach out to share your thoughts & suggestions!
                </Typography>
              </div>

              <IconButton>
                <ArrowRightUp />
              </IconButton>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
