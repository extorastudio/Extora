import type { FastifyInstance } from "fastify";
import type { EventBus } from "@extora/types";

interface WsClient {
  id: string;
  socket: WebSocket;
  subscribedEvents: Set<string>;
  connectedAt: Date;
}

class WebSocketManager {
  private clients = new Map<string, WsClient>();

  registerClient(socket: WebSocket): WsClient {
    const id = `ws_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const client: WsClient = {
      id,
      socket,
      subscribedEvents: new Set(),
      connectedAt: new Date(),
    };
    this.clients.set(id, client);
    return client;
  }

  removeClient(id: string): void {
    this.clients.delete(id);
  }

  getClient(id: string): WsClient | undefined {
    return this.clients.get(id);
  }

  subscribe(clientId: string, eventType: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.subscribedEvents.add(eventType);
    }
  }

  unsubscribe(clientId: string, eventType: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.subscribedEvents.delete(eventType);
    }
  }

  broadcast(eventType: string, payload: unknown): number {
    let sent = 0;
    for (const client of this.clients.values()) {
      if (client.subscribedEvents.has(eventType) || client.subscribedEvents.has("*")) {
        try {
          client.socket.send(JSON.stringify({
            type: eventType,
            payload,
            timestamp: new Date().toISOString(),
          }));
          sent++;
        } catch {
          this.removeClient(client.id);
        }
      }
    }
    return sent;
  }

  getStats(): { totalClients: number; subscriptions: number } {
    let totalSubs = 0;
    for (const client of this.clients.values()) {
      totalSubs += client.subscribedEvents.size;
    }
    return {
      totalClients: this.clients.size,
      subscriptions: totalSubs,
    };
  }
}

export function registerWebSocketEndpoint(
  server: FastifyInstance,
  eventBus: EventBus,
): WebSocketManager {
  const wsManager = new WebSocketManager();

  // Register WebSocket upgrade handler using a Fastify-compatible approach
  server.get("/api/v1/ws", { websocket: true }, (socket: WebSocket, req) => {
    const client = wsManager.registerClient(socket);

    // Send welcome message
    socket.send(JSON.stringify({
      type: "connected",
      payload: { clientId: client.id, message: "Connected to Extora WebSocket" },
      timestamp: new Date().toISOString(),
    }));

    // Handle incoming messages
    socket.addEventListener("message", (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data as string) as {
          action?: string;
          event?: string;
        };

        if (msg.action === "subscribe" && msg.event) {
          wsManager.subscribe(client.id, msg.event);
          socket.send(JSON.stringify({
            type: "subscribed",
            payload: { event: msg.event },
            timestamp: new Date().toISOString(),
          }));
        } else if (msg.action === "unsubscribe" && msg.event) {
          wsManager.unsubscribe(client.id, msg.event);
        } else if (msg.action === "ping") {
          socket.send(JSON.stringify({ type: "pong", timestamp: new Date().toISOString() }));
        }
      } catch {
        // Ignore malformed messages
      }
    });

    // Handle disconnect
    socket.addEventListener("close", () => {
      wsManager.removeClient(client.id);
    });
  });

  // Stats endpoint
  server.get("/api/v1/ws/stats", async () => wsManager.getStats());

  return wsManager;
}
