import { describe, it, expect } from "vitest";
import {
  createMockLogger,
  createMockEventBus,
  createMockCache,
  createMockConfig,
  createMockHookRegistry,
  createMockMediaItem,
  createMockPaginatedResponse,
} from "../src/testing";

describe("Mock Factories", () => {
  describe("createMockLogger", () => {
    it("should create a logger with all methods", () => {
      const logger = createMockLogger();
      expect(typeof logger.debug).toBe("function");
      expect(typeof logger.info).toBe("function");
      expect(typeof logger.warn).toBe("function");
      expect(typeof logger.error).toBe("function");
      expect(typeof logger.child).toBe("function");
      expect(() => { logger.info("test"); }).not.toThrow();
    });
  });

  describe("createMockEventBus", () => {
    it("should publish and subscribe events", async () => {
      const bus = createMockEventBus();
      const received: unknown[] = [];
      bus.subscribe("test", async (p) => { received.push(p); });
      await bus.publish("test", { value: 42 });
      expect(received).toHaveLength(1);
      expect(received[0]).toEqual({ value: 42 });
    });

    it("should unsubscribe handlers", async () => {
      const bus = createMockEventBus();
      const received: unknown[] = [];
      const handler = async (p: unknown) => { received.push(p); };
      bus.subscribe("test", handler);
      bus.unsubscribe("test", handler);
      await bus.publish("test", {});
      expect(received).toHaveLength(0);
    });
  });

  describe("createMockCache", () => {
    it("should store and retrieve values", async () => {
      const cache = createMockCache();
      await cache.set("key", "value");
      expect(await cache.get("key")).toBe("value");
    });

    it("should return null for missing keys", async () => {
      const cache = createMockCache();
      expect(await cache.get("missing")).toBeNull();
    });

    it("should delete keys", async () => {
      const cache = createMockCache();
      await cache.set("key", "value");
      await cache.del("key");
      expect(await cache.get("key")).toBeNull();
    });

    it("should check key existence", async () => {
      const cache = createMockCache();
      await cache.set("key", "value");
      expect(await cache.has("key")).toBe(true);
      expect(await cache.has("missing")).toBe(false);
    });

    it("should clear all keys", async () => {
      const cache = createMockCache();
      await cache.set("a", 1);
      await cache.set("b", 2);
      await cache.clear();
      expect(await cache.get("a")).toBeNull();
    });

    it("should getOrSet with factory", async () => {
      const cache = createMockCache();
      const result = await cache.getOrSet("computed", async () => 99);
      expect(result).toBe(99);
      expect(await cache.get("computed")).toBe(99);
    });
  });

  describe("createMockConfig", () => {
    it("should store and retrieve config values", async () => {
      const config = createMockConfig();
      await config.set("site.name", "Extora");
      expect(await config.get("site.name")).toBe("Extora");
    });

    it("should return all config", async () => {
      const config = createMockConfig();
      await config.set("a", 1);
      const all = await config.getAll();
      expect(all).toEqual({ a: 1 });
    });
  });

  describe("createMockHookRegistry", () => {
    it("should execute action hooks", async () => {
      const hooks = createMockHookRegistry();
      const calls: string[] = [];
      hooks.addAction("init", async () => { calls.push("a"); });
      hooks.addAction("init", async () => { calls.push("b"); });
      await hooks.doAction("init");
      expect(calls).toEqual(["a", "b"]);
    });

    it("should apply filter hooks", async () => {
      const hooks = createMockHookRegistry();
      hooks.addFilter<number>("price", async (v) => v * 2);
      hooks.addFilter<number>("price", async (v) => v + 1);
      const result = await hooks.applyFilters("price", 10);
      expect(result).toBe(21);
    });
  });

  describe("createMockMediaItem", () => {
    it("should return a media item with defaults", () => {
      const media = createMockMediaItem();
      expect(media.id).toBe("mock-media-1");
      expect(media.filename).toBe("test.jpg");
      expect(media.mimeType).toBe("image/jpeg");
    });

    it("should accept overrides", () => {
      const media = createMockMediaItem({ id: "custom", filename: "custom.png" });
      expect(media.id).toBe("custom");
      expect(media.filename).toBe("custom.png");
    });
  });

  describe("createMockPaginatedResponse", () => {
    it("should wrap data in pagination", () => {
      const response = createMockPaginatedResponse([1, 2, 3]);
      expect(response.data).toEqual([1, 2, 3]);
      expect(response.pagination.total).toBe(3);
      expect(response.pagination.page).toBe(1);
      expect(response.pagination.totalPages).toBe(1);
    });
  });
});
