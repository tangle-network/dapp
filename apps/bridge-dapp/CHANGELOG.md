# Changelog

All notable changes to this project will be documented in this file.

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

[Unreleased]: https://github.com/webb-tools/webb-dapp/compare/v0.0.1...HEAD
[0.0.7]: https://github.com/webb-tools/webb-dapp/releases/tag/v0.0.7
[0.0.8]: https://github.com/webb-tools/webb-dapp/releases/tag/v0.0.8
