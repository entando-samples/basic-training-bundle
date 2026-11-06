// Types for what our widget receives from the other widgets and from Entando.

// The data of the "hello" event, published by hello-sender.
export interface HelloEvent {
  text: string;
}

// What Entando writes into the "config" attribute.
export interface WidgetConfig {
  contextParams?: { page_code?: string }; // "contextParams" in entando.json
  systemParams?: {
    // "apiClaims" in entando.json: for each claim, the address of the microservice.
    api?: Record<string, { url?: string } | undefined>;
  };
}

// The answer of GET /api/secret in hello-ms.
export interface SecretResponse {
  message: string;
}

declare global {
  interface Window {
    entando?: {
      // Entando publishes, for every widget, the address where its files are served.
      widgets?: Record<string, { basePath?: string } | undefined>;
      // The Keycloak connection of the page: is the user signed in, and their token.
      keycloak?: {
        authenticated?: boolean;
        token?: string;
        // Asks Keycloak for a new token if this one expires within the given seconds.
        updateToken?(minValidity: number): Promise<boolean>;
      };
    };
  }
}
