// Entry point of the bundle: register the custom element once, even if the script is loaded twice.
import { HelloReceiver } from './hello-receiver';

if (!customElements.get('hello-receiver')) {
  customElements.define('hello-receiver', HelloReceiver);
}
