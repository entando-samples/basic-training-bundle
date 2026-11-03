// hello-sender: our first micro frontend (MFE).
// An MFE is a piece of a web page packaged as a custom HTML element: <hello-sender>.
class HelloSender extends HTMLElement {
  // The browser calls connectedCallback when the element appears on the page.
  connectedCallback() {
    this.innerHTML = '<p>Hello from the sender!</p>';
  }
}

customElements.define('hello-sender', HelloSender);
