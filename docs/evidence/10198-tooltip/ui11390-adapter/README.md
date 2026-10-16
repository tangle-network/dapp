# Dapp Tooltip portal adapter: scoped real-browser proof

The local Tooltip renderer now delegates to the checked shared Provider, Root, Trigger and Content. The public prop-name/title/action-content adapter remains for 34 live consumers; this is renderer removal, not deletion of that public API. `isDisablePortal` maps to `portal={!isDisablePortal}`; default Portal, side/offset, asChild and native refs are preserved through the shared owner. The two actual Sidebar Item/SubItem → WithInfo paths use the same shared contexts. ExpandTableButton's direct legacy Trigger import was also removed.

Tested executable source: `6925ec46adadc526971c5f92cbfacbbf9a567e00`. Source changes since prior publication81a78b36 are nine files, +126/-192, net66 lines removed; evidence additions are separate. UI11.39.0/Brand1.25.1/Motion14.1.0 is the checked package cohort. The [owner release](https://github.com/tangle-network/brand/releases/tag/%40tangle-network/ui%4011.39.0) is source38cded171f44397391c629a265148fb205a142a1; actual installed Tooltip source SHA256 is `e976d256761b6972767524a9ead5df2f330a31aa59b862b36253f6e5ecedbf54`. The owner React19.3/Tooltip1.2.16 fixture is separate from this actual consumer's React/DOM18.3.1, UI-relative Tooltip1.4.1 and Presence1.1.11. Each run retains actual module paths/hashes after the frozen link.

## Composite result, not one byte-identical run

| Accepted condition | Original capture | Observer | Viewport |
| --- | --- | --- | --- |
| Desktop / light / normal | [cde48f original media and observations](source-run-cde48f/desktop-light-no-preference/) | 5c19 | 1440 × 1000 |
| Desktop / light / reduced | [cde48f original media and observations](source-run-cde48f/desktop-light-reduce/) | 5c19 | 1440 × 1000 |
| Phone / light / reduced | [cde48f original media and observations](source-run-cde48f/phone-light-reduce/) | 5c19 | 390 × 844 |
| Phone / light / normal | [db117c original media and observations](targeted-phone-db117c/phone-light-no-preference/) | 8bea, readonly native-scroll telemetry | 390 × 844 |

The [byte-preserved consumer receipt](provenance/composite-consumer-receipt.raw.txt) maps every selected case to its actual source, fixture/observer hashes, actors, CSS and observations. The same App hash6e4f3eaf is used throughout. Selection is explicit: the failed cde phone/normal case is retained and is not silently relabelled.

The selected four cases establish 16 native close/reopen checks: eight normal same-retained-node DOM-open publications before the original close + computed owner-role deadline, with persistence afterward; eight reduced-motion cases allowing replacement nodes. They also establish four native sibling arbitrations, four generic native-disabled Button Enter checks and eight actual Item/SubItem Enter activations to a local fragment. Default Portal/defaultOpen and local asChild/ref behavior were observed. Native Tab/Shift+Tab and trusted focus are separate from the untrusted internal `tooltip.open` CustomEvent; that event can precommit and is not the publication predicate.

Each selected case has zero console errors and zero document overflow. Actual fresh post-build CSS hashes match the HTTP stylesheet bodies observed by the browser; the earlier pre-build snapshot is not used as build acceptance. The selected evidence contains 36 original viewport PNGs and four original uncut WebMs. Stills and chronological decoded video samples were inspected; no native full-playback, calibrated timing or physical-device claim is made.

## Ownership and readability

Enabled leaf Item binds the Tooltip to the focused native/router anchor. Link forwards those native anchor refs; its existing fragment/no-href API remains unchanged. WithInfo now honors the shared Root's onChange for native focus, Escape, sibling and activation semantics, and delegates pointer handling to the shared Trigger instead of directly opening state from mouse handlers.

The consumer base stylesheet previously forced a foreground onto every p/div/span/label, overriding inherited inverse-panel text. The existing default foreground now lives once on html/body. Shared nested surfaces inherit their owning color; the composed Tooltip title and WithInfo Typography explicitly inherit through their existing className API. No global descendant recolor, local inverse-panel token or shared motion fork was added.

The 16 selected placement samples measure text rgb(236,238,243) on panel rgb(45,45,45), computed contrast11.864054747019425. The guard uses the [normal-text contrast threshold](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) only as a scoped regression check. This does not establish full accessibility or design-bible acceptance. Before-fix numeric contrast is UNKNOWN; the earlier unreadability finding is visual and source-based.

Desktop WithInfo resolves right/24px and phone resolves its existing top/4px behavior. Standalone requests bottom/11px and bottom/13px retain their offsets. Phone collision flips are accepted only when actual boxes show insufficient space on the requested side; requested/resolved side, free space, bounds and offsets remain recorded. Product positioning was not forced to satisfy an observer.

## Failures and observer corrections remain original

| Run | Authoritative result | Meaning and retained limit |
| --- | --- | --- |
| [f4022c gate](provenance/gate-f4022c.raw.txt) | Exit2 | Frozen install and actual actor/source probe passed; my unsupported ui/tooltip import stopped typecheck before build/browser/push. Imports were corrected to the existing maintained ui/primitives export. No Avatar annotation workaround. |
| [888c7d original capture](observer-baseline-888c7d/) | Exit1 | Forced-side assertions rejected legitimate phone flips; sibling snapshots preceded settled arbitration. Old case PASS fields despite failed steps are an instrument defect, preserved unchanged. The overall exit1 remains authoritative. Its unreadable text was repaired at the owning inheritance seam; no numeric beforecontrast claim. |
| [cde48f phone/normal failure](source-run-cde48f/phone-light-no-preference/) | One failed cell in an exit1 run | Accepted DOM reopen then Root reclosed before the old deadline. Historical cause remains UNKNOWN because scroll was not instrumented. Native focus autoscroll is a mechanism hypothesis, not proven cause. This observed red is not erased by a later pass. |
| [db117c targeted phone capture](targeted-phone-db117c/) | Exit0, scoped | The native Tab handoff moved to a remote input and document scroll5946.6ms occurred while the watched trigger was closed, before returned focus5951.7ms. Same retained DOM open5955.2ms preceded the old6032.3ms deadline and persisted6142ms. No ancestor/document scroll was observed after returned focus in that persistence window. This qualifies the new capture, not the cause of the old close. |

Frozen [4c1e observer](provenance/observer-4c1e.raw.txt), [5c19 observer](provenance/observer-5c19.raw.txt), and [8bea observer](provenance/observer-8bea.raw.txt) bytes are retained. 5c19 corrects the collision premise, records immediate versus settled/past-role sibling state, measures text colors and fails the case verdict on failed steps/console/viewport/overflow. 8bea adds readonly native scroll/keydown/geometry snapshots before first input. External dismissal after returned focus leaves the persistent-open premise UNCHECKED; disappearance is not silently accepted. Neither correction claims a byte-identical frozen-runner pass.

All three browser runs, including failures, retain 81 original PNGs, nine original uncut WebMs and nine raw case observations in total. Derived contact sheets are excluded from ORIGINAL media counts and publication. Raw JSON/log/source originals use `.raw.txt` to survive normal formatting hooks unchanged.

## Gate and acceptance limits

Frozen install reuse is from f4022c under unchanged package/lock and actual installed identity guards. At source692, cde48f typecheck/fresh cloud build had zero TypeScript diagnostics; its overall exit1 is a browser result, not a type/build pass mask. db117c reused that exact source/build/CSS with readonly identity checks and ran only the targeted phone capture. No unchanged source suite or broad runtime matrix was replayed. Normal push hooks remain required for publication.

Disabled/no-href Sidebar fragment and nonfocusable-wrapper keyboard-description behavior remains UNCHECKED. Generic native-disabled Button proof does not establish disabled Sidebar keyboard behavior. Only local fragment activation was exercised: no account, wallet, payment, backend operation or production mutation.

Dark/full touched-surface coverage, shared Sandbox SidebarS1 frame adoption, design-bible/launch QA, calibrated timing, latency, physical-device and served-production acceptance remain incomplete or UNKNOWN. PR3339 remains draft and board10198 remains open. The [prior11.38.2 proof](https://github.com/tangle-network/dapp/tree/81a78b36b1f35fff7b1eee2fab66b8ef156cf2a2/docs/evidence/10198-tooltip) and its original historical actor correction remain immutable at that commit.

The manifest is produced from committed Git objects after normal hooks, then verified again at the final publication head against original capture bytes and blob OIDs. Documentation commits differ from the tested executable source and do not imply a new runtime run.


## Publication formatting correction

The first normal publication push (f0dd02) failed its existing `format:check` on Link, WithInfo and Tooltip. Lint passed; source tests/build and remote publication were not reached. The original full hook output is retained in [the failure log](provenance/gate-f0dd02-publication-failure.raw.txt).

Installed repository Prettier formatted exactly those three files in `bf31ee0e`. These bytes differ from tested executable692; [the separate equivalence receipt](provenance/format-equivalence.raw.txt) records before/after hashes and equivalent normalized TypeScript and emitted-JavaScript ASTs. The normalization excludes trivia, redundant parentheses and whitespace-only JSX nodes. Runtime proof remains at692, rather than claiming an exact byte-equivalent final source. The formatter delta is +7/-10; final source changes relative to81a78 are +126/-195, net69 lines removed. No runtime replay was requested for formatting. Final documentation publication verifies committed objects and normal push hooks separately.
