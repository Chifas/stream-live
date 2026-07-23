import type { ServerEvent } from "@/lib/types";
import { logger } from "@/lib/logger";

/**
 * Bus de eventos del chat. Por defecto es en memoria (una sola instancia). Si se
 * define `REDIS_URL`, usa Redis pub/sub para propagar mensajes entre varias
 * instancias del servidor detrás de un balanceador.
 *
 * El contador de espectadores se mantiene local a cada instancia (ver MEJORAS).
 */

type Deliver = (channel: string, event: ServerEvent) => void;

export interface Bus {
  publish(channel: string, event: ServerEvent): void;
  onMessage(handler: Deliver): void;
}

const REDIS_TOPIC = "streamlive:chat";

class InMemoryBus implements Bus {
  private handler: Deliver = () => {};
  publish(channel: string, event: ServerEvent) {
    this.handler(channel, event);
  }
  onMessage(handler: Deliver) {
    this.handler = handler;
  }
}

class RedisBus implements Bus {
  private handler: Deliver = () => {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private pub: any, sub: any) {
    sub.subscribe(REDIS_TOPIC);
    sub.on("message", (_topic: string, payload: string) => {
      try {
        const { channel, event } = JSON.parse(payload);
        this.handler(channel, event);
      } catch {
        /* payload inválido */
      }
    });
  }
  publish(channel: string, event: ServerEvent) {
    // No entregamos en local: llegará por la suscripción (incluida esta instancia).
    this.pub.publish(REDIS_TOPIC, JSON.stringify({ channel, event }));
  }
  onMessage(handler: Deliver) {
    this.handler = handler;
  }
}

export async function createBus(): Promise<Bus> {
  const url = process.env.REDIS_URL;
  if (!url) return new InMemoryBus();
  try {
    const { default: Redis } = await import("ioredis");
    const pub = new Redis(url);
    const sub = new Redis(url);
    logger.info("Chat usando Redis pub/sub", { url });
    return new RedisBus(pub, sub);
  } catch (err) {
    logger.warn("No se pudo conectar a Redis; usando bus en memoria", {
      error: String(err),
    });
    return new InMemoryBus();
  }
}
