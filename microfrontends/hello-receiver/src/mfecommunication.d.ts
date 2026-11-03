// Types for @entando/mfecommunication: the library ships no types, so we describe the part we use.
declare module '@entando/mfecommunication' {
  interface Subscriber<T> {
    callerId: string;
    callback: (data: T) => void;
  }
  interface Mediator {
    subscribe<T>(eventType: string, subscriber: Subscriber<T>): void;
    unsubscribe(eventType: string, callerId: string): void;
    publish<T>(eventType: string, data: T): void;
  }
  export const mediatorInstance: Mediator;
}
