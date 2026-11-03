// Types for what our widget receives from the other widgets and from Entando.

// The data of the "hello" event, published by hello-sender.
export interface HelloEvent {
  text: string;
}

// What Entando writes into the "config" attribute (see "contextParams" in entando.json).
export interface WidgetConfig {
  contextParams?: { page_code?: string };
}
