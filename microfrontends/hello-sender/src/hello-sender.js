// hello-sender: our first micro frontend (MFE).
// An MFE is a piece of a web page packaged as a custom HTML element: <hello-sender>.
class HelloSender extends HTMLElement {
  // The browser calls connectedCallback when the element appears on the page.
  connectedCallback() {
    // Entando writes the widget settings into the "config" attribute, as JSON text.
    const config = JSON.parse(this.getAttribute('config'));
    // The API claim "hello-api" gives us the address of the microservice.
    const apiUrl = config.systemParams.api['hello-api'].url;
    this.innerHTML = '<p>Loading...</p>';
    fetch(apiUrl + '/api/hello')
      .then((response) => response.json())
      .then((data) => this.show(data.message + ' Visits: ' + data.visits))
      .catch(() => { this.innerHTML = '<p>The microservice is not reachable.</p>'; });
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
