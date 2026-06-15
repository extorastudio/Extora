import type { EventBus } from "@extora/types";

let _eventBus: EventBus | null = null;

export function setEventBus(bus: EventBus): void {
  _eventBus = bus;
}

export async function publishEvent<T>(type: string, payload: T, source?: string): Promise<void> {
  if (!_eventBus) {
    console.warn(`Cannot publish "${type}": event bus not available`);
    return;
  }
  await _eventBus.publish(type, payload, source);
}

export function subscribeEvent<T>(
  type: string,
  handler: (payload: T) => Promise<void>,
  source?: string,
): void {
  if (!_eventBus) {
    console.warn(`Cannot subscribe to "${type}": event bus not available`);
    return;
  }
  _eventBus.subscribe(type, handler as (p: unknown) => Promise<void>, source);
}
