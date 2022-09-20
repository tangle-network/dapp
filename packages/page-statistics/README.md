<h1 align="center">Webb Statistic 🕸️ </h1>
<div align="center">
   <a href="https://www.webb.tools/">
      <picture>
         <source media="(prefers-color-scheme: dark)" srcset="../../.github/assets/new-webb-icon-light.svg">
         <img alt="Webb Logo" src="../../.github/assets/new-webb-icon-dark.svg">
      </picture>
   </a>
</div>
<p align="center">
    <strong>🚀  A decentralized interface into the Webb protocol 🚀</strong>
    <br />
</p>

# Prerequisites

This repository makes use of yarn, nodejs, and requires version node v16. To install node.js binaries, installers, and source tarballs, please visit https://nodejs.org/en/download/. Once node.js is installed you may proceed to install [`yarn`](https://classic.yarnpkg.com/en/docs/install):

```bash
npm install --global yarn
```

Great! Now your **Node** environment is ready! 🚀🚀

## Run locally 💻

Once the development environment is set up, you may proceed to install the required dependencies and run the statistic app locally.

1. Clone this repo

   ```bash
   git clone git@github.com:webb-tools/webb-dapp.git && cd webb-dapp
   ```

2. Install dependencies by `yarn`

   ```bash
   yarn install
   ```

3. Start the statistic app:

   ```bash
   yarn start:stats
   ```

   Visit http://localhost:3000/ to see the Webb Dapp UI! 🕸️ 🚀

4. Build the statistic app:

   ```bash
   yarn build:stats
   ```

   Your production build in on `packages/page-statistics/build`.

5. Visualize the bundler using:

   ```bash
   yarn analyze:stats
   ```

   Check out http://127.0.0.1:8888/ to see the visualization.
