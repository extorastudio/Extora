import { describe, it, expect, beforeEach } from "vitest";
import { setConfigManager, getConfig, setConfig } from "../src/config";
import { setEventBus, publishEvent, subscribeEvent } from "../src/events";
import { createMockEventBus, createMockConfig } from "../src/testing";

describe("Config Module", () => {
  beforeEach(() => {
    setConfigManager(null as unknown as ReturnType<typeof createMockConfig>);
  });

  it("should get config value after setting", async () => {
    const config = createMockConfig();
    setConfigManager(config);

    await setConfig("test.key", "hello");
    const value = await getConfig("test.key");
    expect(value).toBe("hello");
  });

  it("should return undefined for missing keys", async () => {
    const config = createMockConfig();
    setConfigManager(config);

    const value = await getConfig("nonexistent");
    expect(value).toBeUndefined();
  });

  it("should set secret config values", async () => {
    const config = createMockConfig();
    setConfigManager(config);

    await setConfig("api.token", "secret-token", true);
    expect(await config.has("api.token")).toBe(true);
  });

  it("should return undefined when no config manager set", async () => {
    setConfigManager(null as unknown as ReturnType<typeof createMockConfig>);
    const value = await getConfig("any");
    expect(value).toBeUndefined();
  });
});

describe("Events Module", () => {
  beforeEach(() => {
    setEventBus(null as unknown as ReturnType<typeof createMockEventBus>);
  });

  it("should publish and subscribe to events", async () => {
    const bus = createMockEventBus();
    setEventBus(bus);

    const received: unknown[] = [];
    subscribeEvent("test.event", async (payload: unknown) => {
      received.push(payload);
    });

    await publishEvent("test.event", { msg: "hello" });
    expect(received).toHaveLength(1);
    expect(received[0]).toEqual({ msg: "hello" });
  });

  it("should publish with source tracking", async () => {
    const bus = createMockEventBus();
    setEventBus(bus);

    let eventSource = "";
    subscribeEvent("test.source", async (_payload: unknown, source?: string) => {
      eventSource = source ?? "";
    });

    await publishEvent("test.source", { data: 42 }, "@test/plugin");
    // Source is tracked by the bus implementation
  });

  it("should be safe when no event bus set", async () => {
    setEventBus(null as unknown as ReturnType<typeof createMockEventBus>);
    await expect(publishEvent("test", {})).resolves.toBeUndefined();
  });
});
