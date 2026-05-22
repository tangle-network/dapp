import { type ChangeEvent, type FC, useCallback, useMemo, useState } from 'react'
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tangle-network/sandbox-ui/primitives'
import { type Hex } from 'viem'
import { useAttestBinaryVersionTx } from '@tangle-network/tangle-shared-ui/data/blueprints/useBinaryUpgradeTx'
import {
  AttestationKind,
  attestationKindLabel,
  severityLabel,
} from '@tangle-network/tangle-shared-ui/blueprintApps/trustScore'

/**
 * Permissionless attest-button form. Any connected wallet can submit one.
 *
 * Two input modes:
 *   1. Report URL (default) — user pastes an IPFS / HTTPS link to a PDF or
 *      structured report. The on-chain hash is left at 0 to match the
 *      contract's "no bundle hash" sentinel (the URI alone is the proof).
 *   2. Upload PDF — user supplies a PDF; we hash it locally with sha256
 *      and submit both the hash and a `pdfsha256:...` placeholder URI,
 *      since the contract enforces a non-empty `reportUri`. The user is
 *      expected to upload the PDF themselves and edit the URI to a real
 *      link before submission.
 *
 * Expiry presets: never / 3m / 6m / 1y. Anything finite must be strictly
 * future, which the form enforces by adding the duration to `Date.now()`.
 */

const ZERO_BYTES32: Hex =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

const SEVERITY_OPTIONS = [0, 1, 2, 3, 4, 5]
const KIND_OPTIONS: AttestationKind[] = [
  AttestationKind.AUDIT,
  AttestationKind.FORMAL,
  AttestationKind.FUZZ,
  AttestationKind.BUG_BOUNTY,
  AttestationKind.SELF,
]

type ExpiryPreset = 'never' | '3m' | '6m' | '1y'
const EXPIRY_LABELS: Record<ExpiryPreset, string> = {
  never: 'Never',
  '3m': '3 months',
  '6m': '6 months',
  '1y': '1 year',
}

const expiryDurationSeconds = (preset: ExpiryPreset): number => {
  switch (preset) {
    case 'never':
      return 0
    case '3m':
      return 60 * 60 * 24 * 90
    case '6m':
      return 60 * 60 * 24 * 180
    case '1y':
      return 60 * 60 * 24 * 365
  }
}

const toHex = (bytes: ArrayBuffer): Hex => {
  const hex = Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `0x${hex}` as Hex
}

const sha256OfFile = async (file: File): Promise<Hex> => {
  const buffer = await file.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', buffer)
  return toHex(digest)
}

interface AttestFormProps {
  blueprintId: bigint
  versionId: bigint
  onClose: () => void
}

export const AttestForm: FC<AttestFormProps> = ({
  blueprintId,
  versionId,
  onClose,
}) => {
  const [mode, setMode] = useState<'url' | 'pdf'>('url')
  const [reportUrl, setReportUrl] = useState('')
  const [reportFile, setReportFile] = useState<File | null>(null)
  const [reportHash, setReportHash] = useState<Hex>(ZERO_BYTES32)
  const [kind, setKind] = useState<AttestationKind>(AttestationKind.AUDIT)
  const [severity, setSeverity] = useState<number>(0)
  const [expiry, setExpiry] = useState<ExpiryPreset>('never')
  const [validationError, setValidationError] = useState<string | null>(null)

  const { execute, isPending, error, txHash, isSuccess } =
    useAttestBinaryVersionTx({ onSuccess: onClose })

  const handleFile = useCallback(async (file: File | null) => {
    setReportFile(file)
    if (file === null) {
      setReportHash(ZERO_BYTES32)
      return
    }
    const hash = await sha256OfFile(file)
    setReportHash(hash)
  }, [])

  const canSubmit = useMemo(() => {
    if (isPending) return false
    if (mode === 'url' && reportUrl.trim().length === 0) return false
    if (mode === 'pdf' && (reportFile === null || reportUrl.trim().length === 0))
      return false
    return true
  }, [isPending, mode, reportUrl, reportFile])

  const handleSubmit = useCallback(async () => {
    if (!execute) {
      setValidationError('Connect a wallet to attest.')
      return
    }
    const trimmedUri = reportUrl.trim()
    if (trimmedUri.length === 0) {
      setValidationError('Provide a URL pointing to the report.')
      return
    }
    const durationSeconds = expiryDurationSeconds(expiry)
    const expiresAt =
      durationSeconds === 0
        ? 0n
        : BigInt(Math.floor(Date.now() / 1000) + durationSeconds)
    setValidationError(null)
    await execute({
      blueprintId,
      versionId,
      reportHash: mode === 'pdf' ? reportHash : ZERO_BYTES32,
      reportUri: trimmedUri,
      kind,
      severityFound: severity,
      expiresAt,
    })
  }, [
    execute,
    reportUrl,
    expiry,
    blueprintId,
    versionId,
    mode,
    reportHash,
    kind,
    severity,
  ])

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h4 className="font-display font-bold text-foreground text-sm">
          Attest v{versionId.toString()}
        </h4>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
      </header>

      <fieldset className="space-y-2">
        <legend className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
          Report
        </legend>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="radio"
            checked={mode === 'url'}
            onChange={() => setMode('url')}
          />
          Provide URL
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="radio"
            checked={mode === 'pdf'}
            onChange={() => setMode('pdf')}
          />
          Upload PDF (and paste its hosted URL below)
        </label>
        {mode === 'pdf' && (
          <Input
            type="file"
            accept="application/pdf"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const file = e.currentTarget.files?.[0] ?? null
              void handleFile(file)
            }}
          />
        )}
        <Input
          placeholder="https://…  or  ipfs://…"
          value={reportUrl}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setReportUrl(e.currentTarget.value)
          }
        />
        {mode === 'pdf' && reportFile && (
          <p className="break-all font-mono text-muted-foreground text-[11px]">
            sha256 {reportHash}
          </p>
        )}
      </fieldset>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Kind</Label>
          <Select
            value={kind.toString()}
            onValueChange={(v: string) => setKind(Number(v) as AttestationKind)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KIND_OPTIONS.map((k) => (
                <SelectItem key={k} value={k.toString()}>
                  {attestationKindLabel(k)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Worst severity</Label>
          <Select
            value={severity.toString()}
            onValueChange={(v: string) => setSeverity(Number(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEVERITY_OPTIONS.map((s) => (
                <SelectItem key={s} value={s.toString()}>
                  {severityLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Expires</Label>
          <Select
            value={expiry}
            onValueChange={(v: string) => setExpiry(v as ExpiryPreset)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(EXPIRY_LABELS) as ExpiryPreset[]).map((preset) => (
                <SelectItem key={preset} value={preset}>
                  {EXPIRY_LABELS[preset]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {validationError && (
        <p className="text-destructive text-xs">{validationError}</p>
      )}
      {error && (
        <p className="text-destructive text-xs">
          Attestation failed: {error.message}
        </p>
      )}
      {txHash && (
        <p className="break-all font-mono text-muted-foreground text-xs">
          Tx hash {txHash}
        </p>
      )}
      {isSuccess && (
        <p className="text-success text-xs">Attestation submitted.</p>
      )}

      <div className="flex justify-end">
        <Button
          variant="sandbox"
          size="sm"
          disabled={!canSubmit}
          loading={isPending}
          onClick={handleSubmit}
        >
          Submit attestation
        </Button>
      </div>
    </div>
  )
}

export default AttestForm
