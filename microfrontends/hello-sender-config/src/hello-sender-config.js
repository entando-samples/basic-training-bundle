// hello-sender-config: the settings form that App Builder shows for the hello-sender widget.
class HelloSenderConfig extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<label>Button text: <input></label>';
    this.querySelector('input').value = this.buttonText || '';
  }

  // App Builder writes "config" when the form opens: the settings saved last time.
  set config(value) {
    this.buttonText = (value && value.buttonText) || '';
    const input = this.querySelector('input');
    if (input) input.value = this.buttonText;
  }

  // App Builder reads "config" when you click Save: we return what the user typed.
  get config() {
    const input = this.querySelector('input');
    return { buttonText: input ? input.value : this.buttonText || '' };
  }
}

customElements.define('hello-sender-config', HelloSenderConfig);
