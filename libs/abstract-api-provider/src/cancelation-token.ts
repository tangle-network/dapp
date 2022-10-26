import { BehaviorSubject } from 'rxjs';
import { filter, first } from 'rxjs/operators';

/**
 * Cancellation token
 *
 * */
export class CancellationToken {
  private cancelled: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /**
   * Throw error if the status is canceled
   * */
  throwIfCancel(e: any = 'Canceled') {
    if (this.cancelled.value) {
      throw e;
    }
  }

  ThrowOnceCanceled(e: any = 'cancelled') {
    this.$canceled()
      .pipe(
        filter((v) => v),
        first()
      )
      .subscribe(() => {
        console.log('canceled');
        throw e;
      });
  }

  isCancelled() {
    return this.cancelled.value;
  }

  cancel() {
    this.cancelled.next(true);
  }

  reset() {
    this.cancelled.next(false);
  }

  get abortSignal(): AbortSignal {
    const abortController = new AbortController();
    this.$canceled()
      .pipe(
        filter((v) => v),
        first()
      )
      .subscribe(() => {
        abortController.abort('Canceled');
      });
    return abortController.signal;
  }

  /**
   * Property watcher for the cancellation status
   * */
  $canceled() {
    return this.cancelled.asObservable().pipe(filter((v) => v));
  }

  /**
   * Handle or throw an error for async operations
   * @param resolver - Resolve the value unless cancel is hit
   * @param  onCancel - Handler for the cancellation
   *
   * */
  handleOrThrow<T = any>(resolver: () => Promise<T>, onCancel: () => any): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const sub = this.$canceled().subscribe(() => {
        // terminate the webb worker on cancellation
        const e = onCancel();
        reject(e);
        sub?.unsubscribe?.();
      });
      resolver()
        .then((value: T) => {
          resolve(value);
        })
        .catch(reject)
        .finally(() => sub.unsubscribe());
    });
  }
}
