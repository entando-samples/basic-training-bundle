// hello-receiver: our second micro frontend (MFE), the custom HTML element <hello-receiver>.
// Written in TypeScript and built with Vite.
import { mediatorInstance } from '@entando/mfecommunication';
import styles from './hello-receiver.css?inline'; // the CSS as text, to put inside the shadow root
import type { HelloEvent, SecretResponse, WidgetConfig } from './entando';

const WIDGET_NAME = 'hello-receiver'; // the "name" of the MFE in entando.json
const EVENT = 'hello'; // published by hello-sender
let instances = 0;

// Asks hello-ms for the secret and returns the text to show.
// The button is visible to everyone: hello-ms decides who may read the secret, and we only show its answer.
export async function readSecret(config: WidgetConfig): Promise<string> {
  const apiUrl = config.systemParams?.api?.['hello-api']?.url; // "apiClaims" in entando.json
  const keycloak = window.entando?.keycloak;
  if (!apiUrl || !keycloak?.authenticated || !keycloak.token) {
    return 'Guest user'; // nobody signed in: we don't even ask
  }
  try {
    await keycloak.updateToken?.(30); // a token lasts a few minutes: renew it if it expires within 30 seconds
    const response = await fetch(`${apiUrl}/api/secret`, {
      headers: { Authorization: `Bearer ${keycloak.token}` }, // the token proves who we are
    });
    if (response.status === 200) {
      return ((await response.json()) as SecretResponse).message;
    }
    if (response.status === 403) {
      return 'No permission'; // signed in, but without the role hello-user
    }
    return 'Guest user'; // 401: hello-ms did not accept the token (expired, fake...)
  } catch {
    return 'Guest user'; // network error, or Keycloak could not renew the token
  }
}

// The address of a file from public/. Entando serves the files of each widget under its own base path,
// so an absolute path like "/mailbox.svg" would point to the site root, not to our widget.
export function assetUrl(file: string): string {
  const basePath = window.entando?.widgets?.[WIDGET_NAME]?.basePath ?? '';
  return `${basePath.replace(/\/$/, '')}/${file}`;
}

export class HelloReceiver extends HTMLElement {
  static observedAttributes = ['config'];

  // A shadow root is a private area of the page, created once per element.
  private readonly root = this.attachShadow({ mode: 'open' });
  // Every element on the page gets its own subscriber id, so removing one does not unsubscribe the others.
  private readonly callerId = `${WIDGET_NAME}-${++instances}`;
  private received?: string;
  private secret?: string; // the last answer of hello-ms, kept when we render again

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

  // Entando (or App Builder) may write a new "config": show it without reloading the page.
  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  // Entando tells the widget which page it is on (contextParams in entando.json).
  private get config(): WidgetConfig {
    try {
      return JSON.parse(this.getAttribute('config') ?? '{}') as WidgetConfig;
    } catch {
      return {}; // a broken config must not break the page
    }
  }

  private render(): void {
    const page = this.config.contextParams?.page_code ?? 'unknown';
    this.root.innerHTML = `<style>${styles}</style>
      <div class="card" part="card">
        <img alt="Mailbox">
        <p></p>
      </div>
      <div class="secret" part="secret">
        <button type="button">Read the secret</button>
        <span></span>
      </div>`;
    this.root.querySelector('img')!.src = assetUrl('mailbox.svg');
    // textContent, not innerHTML: the text comes from another MFE and must never become HTML.
    this.root.querySelector('p')!.textContent =
      this.received === undefined ? `Waiting for a message on page ${page}` : `Received: ${this.received}`;
    this.root.querySelector('span')!.textContent = this.secret ?? '';
    // innerHTML above creates a new button every time, so we connect the click again.
    this.root.querySelector('button')!.onclick = async () => {
      this.secret = await readSecret(this.config);
      this.render();
    };
  }
}
