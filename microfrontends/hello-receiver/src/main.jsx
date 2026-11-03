// hello-receiver: our second micro frontend (MFE), the custom HTML element <hello-receiver>.
// The element is the contract with Entando; React draws what is inside it (src/App.jsx).
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

class HelloReceiver extends HTMLElement {
  // Entando writes the settings of the widget into the "config" attribute: we watch it.
  static observedAttributes = ['config']

  // The browser calls connectedCallback when the element appears on the page: start React.
  connectedCallback() {
    this.root = createRoot(this)
    this.render()
  }

  // The browser calls disconnectedCallback when the element leaves the page: stop React.
  disconnectedCallback() {
    this.root.unmount()
    this.root = null
  }

  // The browser calls attributeChangedCallback when "config" changes: draw again with the new value.
  attributeChangedCallback() {
    this.render()
  }

  render() {
    const config = JSON.parse(this.getAttribute('config') || '{}') // the attribute is text: read it as JSON
    this.root?.render(<App config={config} />) // no root yet = not on the page yet
  }
}

customElements.define('hello-receiver', HelloReceiver)
