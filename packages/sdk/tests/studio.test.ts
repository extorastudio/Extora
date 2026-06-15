import { describe, it, expect, beforeEach } from "vitest";
import {
  registerSlot,
  registerRoute,
  getRegisteredSlots,
  getRegisteredRoutes,
  clearStudioRegistrations,
  STUDIO_SLOTS,
} from "../src/studio";

describe("Studio SDK", () => {
  beforeEach(() => {
    clearStudioRegistrations();
  });

  describe("registerSlot", () => {
    it("should register a slot", () => {
      registerSlot(STUDIO_SLOTS.DASHBOARD_WIDGET, "MyWidget");
      const slots = getRegisteredSlots();
      expect(slots).toHaveLength(1);
      expect(slots[0]?.name).toBe("dashboard.widget");
      expect(slots[0]?.component).toBe("MyWidget");
    });

    it("should sort slots by priority", () => {
      registerSlot("test.slot", "Low", 20);
      registerSlot("test.slot", "High", 5);
      const slots = getRegisteredSlots();
      expect(slots[0]?.component).toBe("High");
      expect(slots[1]?.component).toBe("Low");
    });

    it("should default priority to 10", () => {
      registerSlot("test.slot", "Default");
      const slots = getRegisteredSlots();
      expect(slots[0]?.priority).toBe(10);
    });
  });

  describe("registerRoute", () => {
    it("should register a Studio route", () => {
      registerRoute({
        path: "/my-plugin",
        label: "My Plugin",
        icon: "Puzzle",
        component: "MyPluginPage",
        permission: "plugin:read",
      });
      const routes = getRegisteredRoutes();
      expect(routes).toHaveLength(1);
      expect(routes[0]?.label).toBe("My Plugin");
      expect(routes[0]?.permission).toBe("plugin:read");
    });
  });

  describe("clearStudioRegistrations", () => {
    it("should clear all slots and routes", () => {
      registerSlot("sidebar.nav", "Nav");
      registerRoute({ path: "/test", label: "Test", component: "Test" });
      clearStudioRegistrations();
      expect(getRegisteredSlots()).toHaveLength(0);
      expect(getRegisteredRoutes()).toHaveLength(0);
    });
  });

  describe("STUDIO_SLOTS constants", () => {
    it("should define all standard slots", () => {
      expect(STUDIO_SLOTS.SIDEBAR_NAV).toBe("sidebar.nav");
      expect(STUDIO_SLOTS.DASHBOARD_WIDGET).toBe("dashboard.widget");
      expect(STUDIO_SLOTS.CONTENT_EDITOR_TOOLBAR).toBe("content.editor.toolbar");
      expect(STUDIO_SLOTS.USER_PROFILE_TAB).toBe("user.profile.tab");
      expect(STUDIO_SLOTS.SETTINGS_SECTION).toBe("settings.section");
    });
  });
});
