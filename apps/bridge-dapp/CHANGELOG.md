# Changelog

All notable changes to this app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- New feature or functionality
- New file or resource

### Changed

- Updates to existing features
- Changes to existing files or resources

### Deprecated

- Features or functionality that will be removed in future versions
- Files or resources that will be removed in future versions

### Removed

- Features or functionality that have been removed
- Files or resources that have been removed

### Fixed

- Bug fixes
- Corrections to existing files or resources

### Security

- Security-related changes, such as vulnerability patches

## [0.0.2] - 2023-04-17

### Added

- Relayer filter by environment: https://github.com/webb-tools/webb-dapp/commit/5c2ef97cd7e7788b858c414f4b9546bdcfcfc2d8
- Relayer fee and refund support: https://github.com/webb-tools/webb-dapp/commit/32ac5b0c7494c7ca746c6e56bda65cbfd692118f
- Added liquidity check on withdrawal: https://github.com/webb-tools/webb-dapp/commit/f9617e364f40b577f0a5bd4d9dc2bc2cea9f3168
- Added failed transaction monitoring: https://github.com/webb-tools/webb-dapp/commit/f9617e364f40b577f0a5bd4d9dc2bc2cea9f3168
- Added max fee calculation: https://github.com/webb-tools/webb-dapp/commit/6f3fa726513accda142dac87b03e2a06e7d094c3

### Changed

- Updated confirmation cards UI: https://github.com/webb-tools/webb-dapp/commit/094b85dbc469f1c8b2250e8030b9b02dcb30d9b1

### Fixed

- Fixed balance calculation: https://github.com/webb-tools/webb-dapp/commit/dece224d7fa739a7b9a02ee3397c9591330e9e9b

## [0.0.3] - 2023-04-25

### Added

- 2 new chains - Avalanche & Scroll: https://github.com/webb-tools/webb-dapp/pull/1048
- 8-sided Bridge with DKG Deployment: https://github.com/webb-tools/webb-dapp/pull/1048

## [0.0.4] - 2023-04-27

### Added

- Fixes quick action prompts: https://github.com/webb-tools/webb-dapp/pull/1147

## [0.0.5] - 2023-04-29

### Fixed

- Only query approval for non-native tokens
- Small UI nits

## [0.0.6] - 2023-05-03

### Added

- VAnchor Substrate Implementation (Missing Withdraw/Transfer Flows): https://github.com/webb-tools/webb-dapp/pull/1139

### [0.0.7] - 2023-05-12

- Hot fix: Fee only subtracted when relayer is selected
- Hot fix: Fee should be 0 when no relayer is selected

### [0.0.8] - 2023-05-12

### Fixed

- Add executorWithTimeout to execute a promise with timeout to prevent handling on the bridge

### Changed

- walletConnectionState payload to pass more info
- Handle Metamask connect wallet error more gracefully
- Parse the relayer error message and display on the bridge dApp
- Initialize the API config with on-chain data after Metamask pop-up

### Added

- Use newer library to detect Metamask extension

### Removed

- eventsWatcher check when filtering the relayer: https://github.com/webb-tools/webb-dapp/pull/1205

## [0.0.9] - 2023-05-15

### Fixed

- Dark/Light theme switching issue: https://github.com/webb-tools/webb-dapp/pull/1222

[Unreleased]: https://github.com/webb-tools/webb-dapp/compare/v0.0.1...HEAD
[0.0.8]: https://github.com/webb-tools/webb-dapp/releases/tag/v0.0.8
[0.0.9]: https://github.com/webb-tools/webb-dapp/releases/tag/v0.0.9

## [0.0.10] - 2023-06-02

### Fixed, Changed and Added

- Footer is now bottom bound
- Upgrade and remove unused/deprecated dependencies
- Unifying `dist` Dirs for all Apps
- Fix Next App Builds
- Disable NX Caching in the CI
- Fix bridge link
- Bridge Improvements ([#1264](https://github.com/webb-tools/webb-dapp/pull/1264))
- Update new deployments
- Add Nix flake devenv
- Fix Bridge Hanging Issue

## [0.0.11] - 2023-06-09

### Fixed, Changed and Added

- Update Orbit Network 06/06/2023 ([#1313](https://github.com/webb-tools/webb-dapp/pull/1313))
- Adds estimated transaction fee tooltip ([#1315](https://github.com/webb-tools/webb-dapp/pull/1315))
- Bridge Mobile UI ([#1285](https://github.com/webb-tools/webb-dapp/pull/1285))
- UI updates for improved transaction flow on bridge ([#1316](https://github.com/webb-tools/webb-dapp/pull/1316))
- Add breakpoint 480px to show one column layout ([#1321](https://github.com/webb-tools/webb-dapp/pull/1321))

## [0.0.12] - 2023-06-28

### Fixed, Changed and Added

- Add token to wallet ([#1341](https://github.com/webb-tools/webb-dapp/pull/1341))
- Optimize fetching contracts data ([#1350](https://github.com/webb-tools/webb-dapp/pull/1350))
- Add Faucet link in navigation menu ([#1350](https://github.com/webb-tools/webb-dapp/pull/1355))
- Utilize Circom Proving for Substrate, Centralized the shared types, Move fetchOnChainConfig logic into webpack ([#1361](https://github.com/webb-tools/webb-dapp/pull/1361))
- Close confirm containers when txn is dismissed ([#1362](https://github.com/webb-tools/webb-dapp/pull/1362))
- Removes extra bg image on bridge ([#1367](https://github.com/webb-tools/webb-dapp/pull/1367))
- Relayer URL and Disable Radio When No Chains To Select ([#1379](https://github.com/webb-tools/webb-dapp/pull/1379))

## [1.0.0] - 2023-09-09

### Fixed, Changed and Added

- Release new Hubble Bridge UI
- Custom the relayer enpoint
- Inputs sync with the URL
- User interaction without wallet connected
- New complete transaction flow with modal
- Refund feature on the transfer flow
- Leaf index validation with edge data on chain on withdraw and transfer flow

## [1.0.1] - 2023-09-19

### Fixed, Changed and Added

- UI improvements
- Leaf Index Checking & Relayer State
- Adopt use-query-params Hook, Eliminate Excessive useEffect for Default State Handling
- Fix Invalid BigNumber String on Tranfer flow

## [1.0.2] - 2023-09-20

### Fixed, Changed and Added

- Adding SEO for Hubble Bridge
- New Orbit & Tangle bridge deployment

## [1.0.3] - 2023-09-21

### Fixed, Changed and Added

- Iterative Improvement For Hubble Bridge ([#1662](https://github.com/webb-tools/webb-dapp/pull/1662))

## [1.0.4] - 2023-09-30

### Fixed, Changed and Added

- Content fixes, spelling fix ([#1685](https://github.com/webb-tools/webb-dapp/pull/1695))
- Updates bridge header dropdown menu items ([#1701](https://github.com/webb-tools/webb-dapp/pull/1701))
- Remove forced goerli connection on wallet reconnect ([#1709](https://github.com/webb-tools/webb-dapp/pull/1709))
- Fix warning badge 0 balance state ([#1715](https://github.com/webb-tools/webb-dapp/pull/1715))
- Sort all non-active chains alphabetically ([#1716](https://github.com/webb-tools/webb-dapp/pull/1716))

## [1.0.5] - 2023-09-30

### Fixed, Changed and Added

- Fix Connect Wallet Modal When Connect Wallet Button Is Clicked [#1723](https://github.com/webb-tools/webb-dapp/pull/1723)

## [1.0.6] - 2023-10-04

### Fixed, Changed and Added

- Adds faucet banner link to bridge dapp [#1734](https://github.com/webb-tools/webb-dapp/pull/1734)
- Adding Support For Multiple Note Accounts [#1731](https://github.com/webb-tools/webb-dapp/pull/1731)
- Fixes hubble bridge layout issues [#1738](https://github.com/webb-tools/webb-dapp/pull/1738)

## [1.0.7] - 2023-10-05

### Fixed, Changed and Added

- Fix UI issues on bridge dapp
- Disable amount input for destination accross flows [#1739](https://github.com/webb-tools/webb-dapp/pull/1739)
