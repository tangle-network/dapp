/**
 * Modal showing job results from operators.
 */

import { FC } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Typography,
  Button,
  SkeletonLoader,
  EMPTY_VALUE_PLACEHOLDER,
} from '@tangle-network/ui-components';
import {
  useJobResults,
  type JobCall,
  type JobResult,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { twMerge } from 'tailwind-merge';

interface Props {
  job: JobCall;
  onClose: () => void;
}

export const JobResultsModal: FC<Props> = ({ job, onClose }) => {
  const { data: results, isLoading } = useJobResults(job.id);

  return (
    <Modal open onOpenChange={(open) => !open && onClose()}>
      <ModalContent size="lg">
        <ModalHeader>Job Results - Call #{job.callId.toString()}</ModalHeader>
        <ModalBody>
          {/* Job Info */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-mono-20 dark:bg-mono-170 rounded-lg">
            <div>
              <Typography variant="body3" className="text-mono-100">
                Job Index
              </Typography>
              <Typography variant="body1" fw="semibold">
                {job.jobIndex}
              </Typography>
            </div>
            <div>
              <Typography variant="body3" className="text-mono-100">
                Status
              </Typography>
              <span
                className={twMerge(
                  'px-2 py-1 rounded text-xs inline-block',
                  job.completed
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400',
                )}
              >
                {job.completed ? 'Completed' : 'Pending'}
              </span>
            </div>
            <div>
              <Typography variant="body3" className="text-mono-100">
                Submitted
              </Typography>
              <Typography variant="body1">
                {new Date(Number(job.submittedAt) * 1000).toLocaleString()}
              </Typography>
            </div>
            <div>
              <Typography variant="body3" className="text-mono-100">
                Results Received
              </Typography>
              <Typography variant="body1">{job.resultCount}</Typography>
            </div>
          </div>

          {/* Input Data */}
          <div className="mb-6">
            <Typography variant="h5" fw="semibold" className="mb-2">
              Input Data
            </Typography>
            <div className="p-3 bg-mono-20 dark:bg-mono-170 rounded-lg font-mono text-sm overflow-x-auto">
              {job.inputs || EMPTY_VALUE_PLACEHOLDER}
            </div>
          </div>

          {/* Results */}
          <div>
            <Typography variant="h5" fw="semibold" className="mb-2">
              Operator Results
            </Typography>
            {isLoading ? (
              <div className="space-y-2">
                <SkeletonLoader className="h-16" />
                <SkeletonLoader className="h-16" />
              </div>
            ) : results && results.length > 0 ? (
              <div className="space-y-3">
                {results.map((result: JobResult) => (
                  <div
                    key={result.id}
                    className="p-4 border border-mono-60 dark:border-mono-140 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Typography variant="body3" className="text-mono-100">
                          Operator
                        </Typography>
                        <Typography variant="body2" className="font-mono">
                          {result.operator.slice(0, 10)}...
                          {result.operator.slice(-8)}
                        </Typography>
                      </div>
                      <div className="text-right">
                        <Typography variant="body3" className="text-mono-100">
                          Submitted
                        </Typography>
                        <Typography variant="body2">
                          {new Date(
                            Number(result.submittedAt) * 1000,
                          ).toLocaleString()}
                        </Typography>
                      </div>
                    </div>
                    <div>
                      <Typography
                        variant="body3"
                        className="text-mono-100 mb-1"
                      >
                        Result
                      </Typography>
                      <div className="p-2 bg-mono-20 dark:bg-mono-180 rounded font-mono text-sm overflow-x-auto max-h-32">
                        {result.result || EMPTY_VALUE_PLACEHOLDER}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-mono-100">
                <Typography variant="body1">
                  No results received yet. Operators are processing this job.
                </Typography>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default JobResultsModal;
