import { type ChangeEvent, type FC, useCallback, useMemo, useState } from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@tangle-network/sandbox-ui/primitives'
import { keccak256, type Hex } from 'viem'
import { usePublishBinaryVersionTx } from '@tangle-network/tangle-shared-ui/data/blueprints/useBinaryUpgradeTx'

/**
 * Owner-only dialog for publishing a new binary version.
 *
 * - sha256 is computed client-side via `crypto.subtle.digest('SHA-256', file)`
 *   so the user is committing to the literal bytes they uploaded. We never
 *   accept a user-supplied hash — that field is read-only.
 * - The binary URL is freeform; the contract accepts ipfs:// or https://.
 *   "Pin file to IPFS automatically" is a placeholder switch: until the
 *   dapp wires a real pinning provider, it stays disabled and the user
 *   supplies the URI themselves. This matches the on-chain contract,
 *   which only stores the URI string — pinning lives off-chain.
 * - The attestation bundle hash is optional; if supplied, we hash the
 *   bundle bytes locally with sha256 and store the digest. Zero bytes32
 *   is the "no bundle" sentinel the contract accepts.
 *
 * The dialog never closes itself on submit; it shows the tx hash and the
 * caller can dismiss when they're satisfied the publish landed.
 */

const ZERO_BYTES32: Hex =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

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

interface PublishVersionDialogProps {
  blueprintId: bigint
  blueprintName?: string
  onClose: () => void
}

export const PublishVersionDialog: FC<PublishVersionDialogProps> = ({
  blueprintId,
  blueprintName,
  onClose,
}) => {
  const [binaryFile, setBinaryFile] = useState<File | null>(null)
  const [binaryHash, setBinaryHash] = useState<Hex | null>(null)
  const [binaryUri, setBinaryUri] = useState('')
  const [attestationFile, setAttestationFile] = useState<File | null>(null)
  const [attestationHash, setAttestationHash] = useState<Hex>(ZERO_BYTES32)
  const [isHashing, setIsHashing] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const { execute, isPending, error, txHash, isSuccess, reset } =
    usePublishBinaryVersionTx()

  const handleBinaryFile = useCallback(async (file: File | null) => {
    setBinaryFile(file)
    setBinaryHash(null)
    if (file === null) return
    setIsHashing(true)
    try {
      const hash = await sha256OfFile(file)
      setBinaryHash(hash)
    } finally {
      setIsHashing(false)
    }
  }, [])

  const handleAttestationFile = useCallback(
    async (file: File | null) => {
      setAttestationFile(file)
      if (file === null) {
        setAttestationHash(ZERO_BYTES32)
        return
      }
      const hash = await sha256OfFile(file)
      setAttestationHash(hash)
    },
    [],
  )

  const canSubmit = useMemo(() => {
    if (isPending || isHashing) return false
    if (binaryHash === null) return false
    if (binaryUri.trim().length === 0) return false
    return true
  }, [isPending, isHashing, binaryHash, binaryUri])

  const handleSubmit = useCallback(async () => {
    if (!execute) {
      setValidationError(
        'Connect a wallet to publish a binary version.',
      )
      return
    }
    if (binaryHash === null) {
      setValidationError('Upload a binary file to compute its sha256 hash.')
      return
    }
    const trimmedUri = binaryUri.trim()
    if (trimmedUri.length === 0) {
      setValidationError('Provide an IPFS or HTTPS URI for the binary.')
      return
    }
    setValidationError(null)
    await execute({
      blueprintId,
      sha256Hash: binaryHash,
      binaryUri: trimmedUri,
      attestationHash,
    })
  }, [execute, binaryHash, binaryUri, attestationHash, blueprintId])

  const handleDismiss = useCallback(() => {
    reset()
    onClose()
  }, [reset, onClose])

  return (
    <Dialog open onOpenChange={(open: boolean) => !open && handleDismiss()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Publish binary version
            {blueprintName ? ` · ${blueprintName}` : ''}
          </DialogTitle>
          <DialogDescription>
            Append a new build to blueprint #{blueprintId.toString()}. The
            file&apos;s sha256 is computed locally before submission.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="binary-file">Binary</Label>
            <Input
              id="binary-file"
              type="file"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const file = e.currentTarget.files?.[0] ?? null
                void handleBinaryFile(file)
              }}
            />
            {binaryFile && (
              <p className="text-muted-foreground text-xs">
                {binaryFile.name} · {(binaryFile.size / 1024).toFixed(1)} KB
              </p>
            )}
            <p className="break-all font-mono text-foreground text-xs">
              sha256{' '}
              {isHashing
                ? 'hashing…'
                : (binaryHash ?? 'upload a file to compute hash')}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="binary-uri">Binary URL</Label>
            <Input
              id="binary-uri"
              placeholder="ipfs://… or https://…"
              value={binaryUri}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setBinaryUri(e.currentTarget.value)
              }
            />
            <p className="text-muted-foreground text-xs">
              The contract stores this URI as-is. Pinning is off-chain;
              upload the file to your pinning provider first, then paste
              the resulting URI here.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="attestation-file">
              Attestation bundle (optional)
            </Label>
            <Input
              id="attestation-file"
              type="file"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const file = e.currentTarget.files?.[0] ?? null
                void handleAttestationFile(file)
              }}
            />
            {attestationFile && (
              <p className="break-all font-mono text-foreground text-xs">
                sha256 {attestationHash}
              </p>
            )}
            <p className="text-muted-foreground text-xs">
              Optional SLSA / sigstore bundle digest. Leave blank for an
              all-zero sentinel.
            </p>
          </div>

          {validationError && (
            <p className="text-destructive text-xs">{validationError}</p>
          )}
          {error && (
            <p className="text-destructive text-xs">
              Publish failed: {error.message}
            </p>
          )}
          {txHash && (
            <p className="break-all font-mono text-muted-foreground text-xs">
              Tx hash {txHash}
            </p>
          )}
          {isSuccess && (
            <p className="text-success text-xs">
              Published. The new version appears in the timeline above.
            </p>
          )}
        </div>

        <footer className="mt-2 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={handleDismiss}>
            {isSuccess ? 'Close' : 'Cancel'}
          </Button>
          {!isSuccess && (
            <Button
              variant="sandbox"
              onClick={handleSubmit}
              disabled={!canSubmit}
              loading={isPending}
            >
              Publish
            </Button>
          )}
        </footer>
      </DialogContent>
    </Dialog>
  )
}

export default PublishVersionDialog
