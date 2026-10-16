# Dapp disabled Tooltip: observed failure and checked owner fix

This is local real-browser evidence for the shared Tooltip used by the dapp Button disabled-explanation adapter. It is not production or full design-bible acceptance. Both original cases use a 390 × 844 light viewport: normal motion and reduced motion. No wallet, payment, account or production mutation was performed.

## Result and retained baseline

| Artifact | Executable source | Normal native close/reopen | Reduced motion |
| --- | --- | --- | --- |
| [UI11.38.1 original receipt](baseline-ui11381/original-receipt.raw.txt) | `7d65a7b6ff83590802c8ffc4e4b22e63c2861fd6` | Accepted reopen then Root reclosed while focus remained; FAIL | PASS |
| [UI11.38.2 inspected receipt](checked-ui11382/consumer-receipt.raw.txt) | `ecffdbc7f9cfb854c4e2910b652353aa97a4d036` | Same retained content reopened before its original deadline and remained open afterward; scoped PASS | New-node reopen, description and disabled safety; scoped PASS |

The baseline is unchanged historical evidence. The checked run used UI11.38.2, Brand1.25.1, Motion14.1.0, React/React DOM18.3.1. UI release source is `79240479cc73c1eaa252b7cae54aa89e338f3bc0`; its checked owner artifact is [the presentation package](https://github.com/tangle-network/brand/releases/download/%40tangle-network/ui%4011.38.2/presentation-package.json). This consumer result uses actual installed UI-relative actor paths and hashes, rather than the root legacy Tooltip dependency.

Gate `beelink2-cf6658666e2380e2e17faf45dbca5082` exited 0 at 2026-10-16T03:52:57Z: 319 seconds overall, zero admission-wait seconds, 302 command seconds. Frozen installation, scoped typecheck, fresh relevant tangle-cloud build, actual browser capture and normal hooked push passed. Author guards before, before push and after matched the executable source above; the gate cache source `0e3e8d2ebc7901509ddb2151ad00269be31f5884` is distinct. Hook TypeScript diagnostics were zero. The exact terminal watcher was armed in the launch operation.

In the normal-motion case the original retained surface closed at 2156.3 ms, giving an owner-role deadline of 2246.3 ms. Trusted native focus returned at 2160.3 ms. The same retained surface actually published open in its DOM at 2164.3 ms, before that deadline, and remained focused/open with its description at 2362.3 ms, after the old deadline. These timestamps establish event order in this capture, not calibrated latency or timing conformance.

Both checked cases retained a native disabled child, a labelled explanatory group and the description “Fixture action is unavailable”; final Escape dismissed the content. Console errors and document overflow were both zero. Sibling behavior was not executed: this original fixture contains one shared Tooltip Root. This run adds no new Enter-activation or full-accessibility claim.

## Original recordings and screenshots

Each directory retains three original viewport PNGs, the original uncut WebM and byte-preserved observations. The checked third still is the final **dismissed** state, not a reopened-state still; the raw trace and original video contain the reopen sequence.

| Case | Failed baseline | Checked owner fix |
| --- | --- | --- |
| Phone / light / normal | [Original media and observations](baseline-ui11381/phone-light-no-preference/) | [Original media and observations](checked-ui11382/phone-light-no-preference/) |
| Phone / light / reduced | [Original media and observations](baseline-ui11381/phone-light-reduce/) | [Original media and observations](checked-ui11382/phone-light-reduce/) |

There are 12 original PNGs and four original uncut WebMs across the baseline and checked run. Checked videos are 3.52 and 3.00 seconds; baseline videos are 5.40 and 3.56 seconds. All six checked stills were inspected; the original videos were decoded and inspected through chronological frame samples. This does not claim native full playback.

## Observer correction and actor provenance

The owner Root fix deliberately dispatches the internal `tooltip.open` CustomEvent before React publishes DOM open state. That event has `isTrusted=false`; it is not trusted native focus. The earlier observer assumed it could require DOM `instant-open` inside that event snapshot. Its old predicate is false in both checked cases and is retained as `OBSERVER_ASSUMPTION_UNQUALIFIED`.

The corrected observer keeps the native input sequence, original close + computed owner-role deadline and product criterion. It independently requires trusted returned focus, actual same-retained-node DOM open mutation before the original deadline, then Root/content persistence after that deadline. Late or unobserved publication would leave that premise UNCHECKED. This is explicitly **not** a byte-identical frozen-runner PASS.

| Observer | SHA256 |
| --- | --- |
| [Frozen baseline observer](provenance/frozen-2ce255.mjs.raw.txt) | `a677639ef427c3dfaa734fe6036c0fcdc918c881b6135aee90e883788cb71003` |
| [Corrected checked observer](provenance/corrected-cf6658.mjs.raw.txt) | `5a53dfe3e6b4e461ce2750eab414c2c04d48a4f9cdee471647d6efb789410919` |

The original receipt's root-direct Tooltip1.2.10/Presence1.1.6 labels described the local legacy actor. [The separate dated correction](provenance/actor-resolution-correction.raw.txt) preserves the original receipt. Actual shared-UI-relative resolution is Tooltip1.4.1/Presence1.1.11, with paths and source hashes in [the current actor snapshot](checked-ui11382/actual-ui-actor-identity.raw.txt). Historical actor provenance is derived from the frozen lock and unchanged dependency resolution; the old capture did not independently snapshot those nested paths. React remains18.3.1. The Brand owner was asked to correct live provenance while preserving its immutable historical proof.

Earlier d35a68 and 7acadb instrument failures are UNQUALIFIED as product evidence: one used delayed input against the dismiss window, and the other began observation after a preparatory timeout. Their original private artifacts remain retained. The later 2ce255 native accepted-reopen failure is the baseline published here.

## Limits and remaining owners

- The optional nonportal TooltipContent variant is separately owner-accepted as `brand-tooltip-nonportal-accepted-10230`, parent #10230, and remains unpublished. Two live Sidebar Item/SubItem consumer paths require it. The remaining local Tooltip is not claimed fully removed.
- Shared Sandbox Sidebar frame correction and consumer acceptance remain separately owned and pending; no local fork was introduced.
- Desktop/dark coverage, the full touched-surface matrix, full motion/design-bible qualification, sibling behavior, calibrated timing, latency, physical-device and served-production evidence remain UNKNOWN or incomplete.
- This proof does not establish wallet, payment, backend or launch-flow acceptance. PR3339 remains draft until its named preconditions are met. No merge or production release is asserted.

Raw JSON originals use `.raw.txt` so normal repository formatting preserves their bytes. The accompanying manifest is computed from committed Git objects after normal hooks, records each blob OID/SHA256/size and excludes only itself. Its evidence commit differs from the tested executable source; documentation publication does not imply a fresh runtime run.
