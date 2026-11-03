// hello-receiver: our second micro frontend (MFE), the custom HTML element <hello-receiver>.
// Written in TypeScript and built with Vite.
import { mediatorInstance } from '@entando/mfecommunication';
import type { HelloEvent } from './entando';

const WIDGET_NAME = 'hello-receiver'; // the "name" of the MFE in entando.json
const EVENT = 'hello'; // published by hello-sender
let instances = 0;

export class HelloReceiver extends HTMLElement {
  // Every element on the page gets its own subscriber id, so removing one does not unsubscribe the others.
  private readonly callerId = `${WIDGET_NAME}-${++instances}`;
  private received?: string;

  // The browser calls connectedCallback when the element appears on the page.
  connectedCallback(): void {
    this.render();
    // Subscribe to the "hello" event: Entando's mediator calls our function at every publish.
    mediatorInstance.subscribe<HelloEvent>(EVENT, {
      callerId: this.callerId,
      callback: (data) => {
        this.received = data.text;
        this.render();
      },
    });
  }

  // The browser calls disconnectedCallback when the element leaves the page: clean up.
  disconnectedCallback(): void {
    mediatorInstance.unsubscribe(EVENT, this.callerId);
  }

  private render(): void {
    this.innerHTML = '<p></p>';
    // textContent, not innerHTML: the text comes from another MFE and must never become HTML.
    this.querySelector('p')!.textContent =
      this.received === undefined ? 'Waiting for a message...' : `Received: ${this.received}`;
  }
}
