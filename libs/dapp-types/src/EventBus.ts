type Event = Record<string, unknown>;

export type Subscription<T extends Event = Event> = {
  [Key in keyof T]?: Array<(val: T[Key]) => any>;
};

export abstract class EventBus<T extends Event> {
  /**
   * Optionally expose the `emit` functionality outside the implementor
   **/
  sendEvent: undefined | (<E extends keyof T>(event: E, data: T[E]) => void) =
    undefined;
  protected subscriptions: Subscription<T> = {};

  /**
   * Register an event and pass a callback
   * @returns Void|Function , Void if the handler is already registered or Function if the handler is registered
   **/
  on<E extends keyof T>(event: E, cb: (val: T[E]) => void): () => void {
    const listeners = this.subscriptions[event];

    if (!listeners || listeners.indexOf(cb) === -1) {
      this.subscriptions[event] = [...(this.subscriptions?.[event] ?? []), cb];
    }

    return () => this.off(event, cb);
  }

  /**
   * emit an event
   **/
  protected emit<E extends keyof T>(event: E, data: T[E]): void {
    this.subscriptions[event]?.forEach((cb) => cb(data));
  }

  /**
   *  Unregister the listener for an event
   *  the reference of the callback function
   **/
  protected off<E extends keyof T>(event: E, cb: (val: T[E]) => void): void {
    const listeners = this.subscriptions[event];

    this.subscriptions[event] = listeners?.filter((c) => c !== cb) ?? [];
  }

  once<E extends keyof T>(event: E, cb: (val: T[E]) => void): () => void {
    const hookedCb = (val: T[E]) => {
      cb(val);
      this.off(event, hookedCb);
    };

    this.subscriptions[event] = [
      ...(this.subscriptions?.[event] ?? []),
      hookedCb,
    ];

    return () => this.off(event, hookedCb);
  }

  unsubscribeAll() {
    this.subscriptions = {} as Subscription<T>;
  }

  unsubscribeAllForEvent<E extends keyof T>(event: E) {
    this.subscriptions[event] = [];
  }
}
