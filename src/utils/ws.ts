type EventCallback = (...args: any[]) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private events: Map<string, EventCallback[]> = new Map();

  constructor(url: string) {
    this.connect(url);
  }

  private url: string = '';
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectTimeout: number = 1000;
  private reconnectTimer: NodeJS.Timeout | null = null;

  private connect(url: string) {
    this.url = url;
    this.establishConnection();
  }

  private establishConnection() {
    this.ws = new WebSocket(this.url);

    this.ws.onmessage = (event) => {
      try {
        const { type, data } = JSON.parse(event.data);
        this.emit(type, data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    }

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
      this.attemptReconnect();
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    }

    this.ws.onopen = () => {
      console.log('WebSocket connected successfully');
      this.reconnectAttempts = 0;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      this.reconnectTimer = setTimeout(() => {
        this.establishConnection();
      }, this.reconnectTimeout * Math.pow(2, this.reconnectAttempts - 1));
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  public on(eventName: string, callback: EventCallback) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    this.events.get(eventName)?.push(callback);
  }

  public emit(eventName: string, data: any) {
    const callbacks = this.events.get(eventName);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  public send(type: string, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    }
  }

  public close() {
    this.ws?.close();
  }
}

export default WebSocketClient;
