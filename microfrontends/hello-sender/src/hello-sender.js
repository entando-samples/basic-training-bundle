// hello-sender: our first micro frontend (MFE).
// An MFE is a piece of a web page packaged as a custom HTML element: <hello-sender>.
class HelloSender extends HTMLElement {
  // The browser calls connectedCallback when the element appears on the page.
  connectedCallback() {
    this.show('Hello from the sender!');
  }

  show(message) {
    this.innerHTML = '<p></p><button></button>';
    this.querySelector('p').textContent = message;
    this.querySelector('button').textContent = 'Send';
    // On click, publish a "hello" event: every MFE that subscribed to it gets the text.
    this.querySelector('button').onclick = () => {
      window.entando.globals.mediator.publish('hello', { text: message });
    };
  }
}

customElements.define('hello-sender', HelloSender);
