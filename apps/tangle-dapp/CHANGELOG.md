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
- Account page with total, transferrable, and locked balances, token transfer modal, vesting information, EVM & Substrate `vest` functionality, and useful links - https://github.com/webb-tools/webb-dapp/pull/2000

### Removed

- Minimum stake column from validator tables - https://github.com/webb-tools/webb-dapp/pull/1847

### Fixed

- Client side data fetching for Header Chips, Key Stats and Nominator Stats containers to address timeout issue when fetching data - https://github.com/webb-tools/webb-dapp/pull/1849

## [0.0.3] - 2024-03-12

### Added

- Manage balances table for the Account page - https://github.com/webb-tools/webb-dapp/pull/2016
- Transaction confirmation cards - https://github.com/webb-tools/webb-dapp/pull/2028
- Validator overview card UI - https://github.com/webb-tools/webb-dapp/pull/2030
- Service table and key metrics on Services Dashboard page - https://github.com/webb-tools/webb-dapp/pull/2032
- Participants table on Service Details page - https://github.com/webb-tools/webb-dapp/pull/2038
- Payouts notification in accounts page - https://github.com/webb-tools/webb-dapp/pull/2033
- Restaking page's layout & UI - https://github.com/webb-tools/webb-dapp/pull/2042
- Jobs list table on Service Details page - https://github.com/webb-tools/webb-dapp/pull/2044
- Signing rules on Service Details page - https://github.com/webb-tools/webb-dapp/pull/2046
- Service details card - https://github.com/webb-tools/webb-dapp/pull/2051
- Role distribution chart for independent profiles on Services Dashboard page - https://github.com/webb-tools/webb-dapp/pull/2052
- Role distribution chart for shared profiles on Services Dashboard page - https://github.com/webb-tools/webb-dapp/pull/2080
- Protocol earnings table on Services Dashboard page - https://github.com/webb-tools/webb-dapp/pull/2056
- 'What is Restaking' card on Services Dashboard page - https://github.com/webb-tools/webb-dapp/pull/2061
- Restaking profile creation modal for independent profiles - https://github.com/webb-tools/webb-dapp/pull/2053
- Restaking profile creation modal for shared profiles - https://github.com/webb-tools/webb-dapp/pull/2081

### Changed

- Validator table on Nominations page is now lazily loaded for improved perceived performance - https://github.com/webb-tools/webb-dapp/pull/2029
- Claim Airdrop page's FAQ content was adjusted for correctness - https://github.com/webb-tools/webb-dapp/pull/2034, https://github.com/webb-tools/webb-dapp/pull/2087
- Optimized key stats container and initial load time in Nomination page - https://github.com/webb-tools/webb-dapp/pull/2048
- Updated balance transfer modal's design - https://github.com/webb-tools/webb-dapp/pull/2083

### Fixed

- Styling issues and UI audit for Account page - https://github.com/webb-tools/webb-dapp/pull/2035
- Styling issues and UI audit for Claim Airdrop page - https://github.com/webb-tools/webb-dapp/pull/2049

## [0.0.4] - 2024-03-21

### Added

- Restaking: Updating Independent profile now has validating, such as not exceeding max restake amount, not decreasing existing restake amount, and more - https://github.com/webb-tools/webb-dapp/pull/2091
- Restaking: Updating Shared profile now has validating, such as not exceeding max restake amount, not decreasing existing restake amount, and more - https://github.com/webb-tools/webb-dapp/pull/2097
- Network switcher: Ability for users to quickly and easily change networks - https://github.com/webb-tools/webb-dapp/pull/2102
- Using caching for faster loading times in nominations & payouts - https://github.com/webb-tools/webb-dapp/pull/2067

### Changed

- Simplified styling of the `RecentTxContainer` component in the account page - https://github.com/webb-tools/webb-dapp/pull/2098
- The accounts page is now the homepage - https://github.com/webb-tools/webb-dapp/pull/2106
- Footer links (twitter, github, etc.) were updated to link to Tangle-specific socials - https://github.com/webb-tools/webb-dapp/pull/2108

### Fixed
- Addressed major performance issues on nominations page by batching requests - https://github.com/webb-tools/webb-dapp/pull/2107

## [0.0.5] - 2024-03-29

### Added

- Intermediate loading page state is now shown when switching between pages; a compromise of Next.js' SSR - https://github.com/webb-tools/webb-dapp/pull/2151

### Changed

- Updated `Connect a Wallet` modal's text content, fixed some typos - https://github.com/webb-tools/webb-dapp/pull/2121
- Updated airdrop claim page's text content, use $TNT - https://github.com/webb-tools/webb-dapp/pull/2122
- Token symbol is now loaded from chain instead of being hard-coded - https://github.com/webb-tools/webb-dapp/pull/2141
- Tangle token icon was updated with new styling - https://github.com/webb-tools/webb-dapp/pull/2147
- Tangle Network's whitepaper link was updated to a new URL - https://github.com/webb-tools/webb-dapp/pull/2157
- Account page's balances, text copy, and vesting information was updated to be more accurate and easy to understand - https://github.com/webb-tools/webb-dapp/pull/2145

### Fixed

- Breadcrumbs of homepage from `Nomination` to `Account` pages - https://github.com/webb-tools/webb-dapp/pull/2128
- Layout should always be scrollable - https://github.com/webb-tools/webb-dapp/pull/2128
- Sidebar Substrate Portal & EVM Explorer links should change depending on active network - https://github.com/webb-tools/webb-dapp/pull/2129
- Fixed issue regarding `getValidatorIdentity` not properly returning the identity names of validators - https://github.com/webb-tools/webb-dapp/pull/2154
- Fixed performance bug in Nomination page, now is back to normal speed - https://github.com/webb-tools/webb-dapp/pull/2150

## [0.0.6] - 2024-04-10

### Added

- Banner for reporting bugs at the top of the page - https://github.com/webb-tools/webb-dapp/pull/2175
- Vesting information is now shown for the Airdrop Claim - https://github.com/webb-tools/webb-dapp/pull/2187
- Mainnet network is now shown in the network selector - https://github.com/webb-tools/webb-dapp/pull/2198
- Pages now have Open Graph meta tags for better sharing on social media - https://github.com/webb-tools/webb-dapp/pull/2204

### Changed

- Updated copy for the Claim Airdrop page - https://github.com/webb-tools/webb-dapp/pull/2177
- Network selector is now shown even when there is no active connected account - https://github.com/webb-tools/webb-dapp/pull/2181
- `Recent transactions` block's text copy has been modified temporarily, until the feature is actually implemented - https://github.com/webb-tools/webb-dapp/pull/2184
- Nomination flow has been updated with a more streamlined design - https://github.com/webb-tools/webb-dapp/pull/2187
- Some pages that are under development are now hidden on production - https://github.com/webb-tools/webb-dapp/pull/2197
- Payouts table is no longer available due to a recent runtime upgrade, it has been updated with a corresponding notice - https://github.com/webb-tools/webb-dapp/pull/2203

### Fixed

- Fixed bugs and links on the Nomination page - https://github.com/webb-tools/webb-dapp/pull/2165
- Significant improvement for the transfer modal's inputs & validation - https://github.com/webb-tools/webb-dapp/pull/2185
- EVM transfers for EVM -> Substrate now work correctly - https://github.com/webb-tools/webb-dapp/pull/2202
- Free balance for EVM accounts is now shown correctly - https://github.com/webb-tools/webb-dapp/pull/2205
- `Open Explorer` link now opens Polkadot/Substrate Explorer or Blockscout, depending on whether the active/connected account is a Substrate or EVM account - https://github.com/webb-tools/webb-dapp/pull/2205
