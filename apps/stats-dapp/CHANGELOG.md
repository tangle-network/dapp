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

### Fixed

- Bug fix for authorities progress bar: https://github.com/webb-tools/webb-dapp/commit/82b8a3a120fb44fa87e4bf0e01c62f778649bdbd
- Bug fix for keygen table: https://github.com/webb-tools/webb-dapp/commit/86dd345497d7a5798be4a19b1a6e3fca80680d26

## [0.0.3] - 2023-04-21

### Fixed

- Bug fix for authorities table in authorities page: https://github.com/webb-tools/webb-dapp/pull/1125

## [0.0.4] - 2023-04-25

### Fixed

- Bug fix to resolve displaying the next DKG key issue: https://github.com/webb-tools/webb-dapp/pull/1140

## [0.0.5] - 2023-04-26

### Fixed

- Removes tx hash from stats-dapp: https://github.com/webb-tools/webb-dapp/pull/1144
- Fixes prev and next proposal buttons: https://github.com/webb-tools/webb-dapp/pull/1144
- Removes open governance chip from details page: https://github.com/webb-tools/webb-dapp/pull/1144
- Replaces Webb avatar logo with Tangle logo: https://github.com/webb-tools/webb-dapp/pull/1144
- Fixes proposal chart to start at first data point: https://github.com/webb-tools/webb-dapp/pull/1145

## [0.0.6] - 2023-04-27

### Fixed

- Fixes proposers not being displayed in proposal drawer: https://github.com/webb-tools/webb-dapp/pull/1149
- Updates stats-dapp build script to include codegen generation: https://github.com/webb-tools/webb-dapp/pull/1149

## [0.0.7] - 2023-04-28

### Fixed

- Bug fix to display correct timeline of proposal events: https://github.com/webb-tools/webb-dapp/pull/1154

### Changed

- Timeline Item component's date & time format: https://github.com/webb-tools/webb-dapp/pull/1154

## [0.0.8] - 2023-05-12

### Fixed

- Typescale and proposals table removed status display: https://github.com/webb-tools/webb-dapp/pull/1206

[Unreleased]: https://github.com/webb-tools/webb-dapp/compare/v0.0.1...HEAD
[0.0.7]: https://github.com/webb-tools/webb-dapp/releases/tag/v0.0.7
[0.0.8]: https://github.com/webb-tools/webb-dapp/releases/tag/v0.0.8

## [0.0.9] - 2023-06-02

### Fixed, Changed and Added

- Fix stats-dapp Netlify build fail
- Fixes Network Thresholds History Chart
- Adds swirl BG image to stats dapp
- Fixes stats keys page refresh issue
- Fixes cumulative proposals graph
- Adds a check for proposal data on proposal detail page to prevent from crashing
- Updates proposals query's fetch policy to always fetch latest data

## [0.0.10] - 2023-06-09

### Fixed, Changed and Added

- Fixes proposal table buggy pagination ([#1310](https://github.com/webb-tools/webb-dapp/pull/1310))

## [0.0.11] - 2023-06-28

### Fixed, Changed and Added

- Fixes stats keys table pagination ([#1338](https://github.com/webb-tools/webb-dapp/pull/1338))
- Fixes stats progress bar session length ([#1358](https://github.com/webb-tools/webb-dapp/pull/1358))
- Fixes inconsistent stats background image ([#1359](https://github.com/webb-tools/webb-dapp/pull/1359))
- Fixes keys table real-time update & progress bar reset ([#1371](https://github.com/webb-tools/webb-dapp/pull/1371))

## [0.0.12] - 2023-08-07

### Fixed, Changed and Added

- Remove proposal page and addresses bugs in keys and authorities page ([#1501](https://github.com/webb-tools/webb-dapp/pull/1501)).

## [0.0.13] - 2023-09-02

### Fixed, Changed and Added

- Adds proposal hooks in stats-dapp to fetch batched proposals ([#1511](https://github.com/webb-tools/webb-dapp/pull/1511))
- Adds proposal table, proposal status container, fixes theme toggle and dropdown issue ([#1525](https://github.com/webb-tools/webb-dapp/pull/1525))
- Adds Proposal Details Page to stats-dapp ([#1549](https://github.com/webb-tools/webb-dapp/pull/1549))
- Stats dApp Fixes: footer, compressed key flex & proposal detail page color ([#1554](https://github.com/webb-tools/webb-dapp/pull/1554))
- Use PolkadotAPI to show live chain data and Bug fixes in stats-dapp ([#1566](https://github.com/webb-tools/webb-dapp/pull/1566))
- Stats dApp fixes and adds rotated key status to key timeline ([#1576](https://github.com/webb-tools/webb-dapp/pull/1576))

## [0.0.14] - 2023-09-09

### Fixed, Changed and Added

- DKG Stats Bug Fixes and UI enhancements ([#1560](https://github.com/webb-tools/webb-dapp/pull/1560))

## [0.0.15] - 2023-09-19

### Fixed, Changed and Added

- UI improvements
- Unifying backend to `webb-ui-kit`

## [0.0.16] - 2023-09-21

### Fixed, Changed and Added

- DKG stats-dapp QA (Sept 13, 2023) fixes part 1 ([#1639](https://github.com/webb-tools/webb-dapp/pull/1639)).

## [0.0.17] - 2023-09-30

### Fixed, Changed and Added

- Show chain name in proposal detail ([#1689](https://github.com/webb-tools/webb-dapp/pull/1689)).
- Fix prev session's active period incorrect progress bar ([#1713](https://github.com/webb-tools/webb-dapp/pull/1713)).

## [0.0.18] - 2023-09-30

### Fixed, Changed and Added

- Update DKG Stats favicon to match with Tangle Marketing favicon [#1725](https://github.com/webb-tools/webb-dapp/pull/1725).
