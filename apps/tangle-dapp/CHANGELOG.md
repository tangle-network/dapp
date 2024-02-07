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

## [0.0.2] - 2024-02-07

### Added

- ERA and current session display - https://github.com/webb-tools/webb-dapp/pull/1781
- Total Validators, Waiting Validators and Active validators count along with Ideal Staked and Inflation Percentage display - https://github.com/webb-tools/webb-dapp/pull/1786
- Active and Waiting Validators table - https://github.com/webb-tools/webb-dapp/pull/1802
- EVM wallet connection and connected network display - https://github.com/webb-tools/webb-dapp/pull/1818
- tTNT wallet balance and total stake balance display - https://github.com/webb-tools/webb-dapp/pull/1843
- Initial Nominations and Payouts table - https://github.com/webb-tools/webb-dapp/pull/1863
- EVM Nomination Flow, Bond More & Change Reward Destination flow - https://github.com/webb-tools/webb-dapp/pull/1887
- Sort validators by Total Stake and Total # of Nominations when selecting validators to nominate - https://github.com/webb-tools/webb-dapp/pull/1893
- EVM Unbond & Rebond Tokens Flow - https://github.com/webb-tools/webb-dapp/pull/1901
- Nomination Update Flow & UI Changes - https://github.com/webb-tools/webb-dapp/pull/1912
- Validator Tables & Selection updates - https://github.com/webb-tools/webb-dapp/pull/1929
- Stop (Staking.chill) nomination flow - https://github.com/webb-tools/webb-dapp/pull/1933
- Withdraw Unbonded Token Flow - https://github.com/webb-tools/webb-dapp/pull/1944
- Substrate wallet connection - https://github.com/webb-tools/webb-dapp/pull/1965
- Payouts Table update & Payout Flow (Payout single and Payout All) supported for both EVM and Substrate wallets  - https://github.com/webb-tools/webb-dapp/pull/1966
- Substrate wallet support for all staking flows (Nominate, Bond More, Unbond, Rebond, Withdraw, Stop Nomination, Update Payee, Update Nominations) - https://github.com/webb-tools/webb-dapp/pull/1997

### Removed

- Minimum stake column from validator tables - https://github.com/webb-tools/webb-dapp/pull/1847

### Fixed

- Client side data fetching for Header Chips, Key Stats and Nominator Stats containers to address timeout issue when fetching data - https://github.com/webb-tools/webb-dapp/pull/1849
