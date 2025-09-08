/**
 * Defines the callback functions for core WebSocket events.
 */
export interface WSHandlers {
  onOpen: (event: Event) => void;
  onMessage: (event: MessageEvent) => void;
  onError: (event: Event) => void;
  onClose: (event: CloseEvent) => void;
}

/**
 * A minimalist, type-safe WebSocket client wrapper.
 *
 * This class provides a thin layer over the native WebSocket API,
 * focusing on simplicity and ease of use without automatic reconnection
 * or message queuing.
 */
export class WsClient {
  private ws: WebSocket | null = null;
  private readonly url: string;
  private readonly protocols?: string | string[];

  /**
   * Creates an instance of WsClient and initiates the connection.
   * @param url The URL to connect to.
   * @param handlers An optional object with callbacks for `onOpen`, `onMessage`, `onError`, and `onClose`.
   * @param protocols An optional string or array of strings for sub-protocols.
   */
  constructor(
    url: string,
    handlers: Partial<WSHandlers> = {},
    protocols?: string | string[]
  ) {
    this.url = url;
    this.protocols = protocols;
    this.connect(handlers);
  }

  /**
   * Initiates the WebSocket connection and attaches event listeners.
   */
  private connect(handlers: Partial<WSHandlers>): void {
    try {
      this.ws = new WebSocket(this.url, this.protocols);

      this.ws.onopen = handlers.onOpen ?? null;
      this.ws.onmessage = handlers.onMessage ?? null;
      this.ws.onerror = handlers.onError ?? null;
      this.ws.onclose = handlers.onClose ?? null;
    } catch (error) {
      console.error("[WsClient] Failed to create WebSocket:", error);
      // If a custom error handler is provided, call it for connection errors too.
      if (handlers.onError) {
        handlers.onError(error as Event);
      }
    }
  }

  /**
   * Returns the current readyState of the WebSocket connection.
   * Follows the standard WebSocket readyState codes:
   * 0 (CONNECTING), 1 (OPEN), 2 (CLOSING), 3 (CLOSED).
   */
  public get readyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  /**
   * Checks if the WebSocket connection is currently open.
   */
  public isConnected(): boolean {
    return this.readyState === WebSocket.OPEN;
  }

  /**
   * Sends data through the WebSocket connection.
   * Will only send if the connection is currently OPEN.
   * @param data The data to send.
   * @returns `true` if the data was sent, `false` otherwise.
   */
  public send(data: string | ArrayBufferLike | Blob | ArrayBufferView): boolean {
    if (this.isConnected()) {
      this.ws!.send(data);
      return true;
    }
    console.warn("[WsClient] Cannot send data: WebSocket is not open.");
    return false;
  }

  /**
   * A convenience method to send a JavaScript object as a JSON string.
   * @param data The object to stringify and send.
   * @returns `true` if the data was sent, `false` otherwise.
   */
  public sendJSON(data: object): boolean {
    try {
      return this.send(JSON.stringify(data));
    } catch (error) {
      console.error("[WsClient] Failed to stringify JSON for sending:", error);
      return false;
    }
  }

  /**
   * Closes the WebSocket connection.
   * @param code A numeric value indicating the status code.
   * @param reason A human-readable string explaining why the connection is closing.
   */
  public close(code?: number, reason?: string): void {
    if (this.ws) {
      this.ws.close(code, reason);
    }
  }
}

// --- USAGE EXAMPLE ---

export const handlers: Partial<WSHandlers> = {
  onOpen: () => {
    console.log("WebSocket connection opened!");
    // Now it's safe to send messages
    //client.sendJSON({ type: "greeting", payload: "Hello from client!" });
  },

  onMessage: (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log("Received message:", message);
    } catch (e) {
      console.log("Received raw data:", event.data);
    }
  },

  onClose: (event) => {
    console.log(`WebSocket connection closed: ${event.code} - ${event.reason}`);
  },

  onError: (error) => {
    console.error("WebSocket error:", error);
  },
};
export default WsClient;