// hello-receiver: our second micro frontend (MFE), the custom HTML element <hello-receiver>.
// The element is the contract with Entando; React draws what is inside it (src/App.jsx).
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

class HelloReceiver extends HTMLElement {
  // The browser calls connectedCallback when the element appears on the page: start React.
  connectedCallback() {
    this.root = createRoot(this)
    this.root.render(<App />)
  }

  // The browser calls disconnectedCallback when the element leaves the page: stop React.
  disconnectedCallback() {
    this.root.unmount()
  }
}

customElements.define('hello-receiver', HelloReceiver)
