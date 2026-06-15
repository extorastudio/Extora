interface StudioSlot {
  name: string;
  component: string;
  priority?: number;
}

interface StudioRoute {
  path: string;
  label: string;
  icon?: string;
  component: string;
  permission?: string;
}

const registeredSlots: StudioSlot[] = [];
const registeredRoutes: StudioRoute[] = [];

export function registerSlot(
  slotName: string,
  componentName: string,
  priority: number = 10,
): void {
  registeredSlots.push({
    name: slotName,
    component: componentName,
    priority,
  });
}

export function registerRoute(route: StudioRoute): void {
  registeredRoutes.push(route);
}

export function getRegisteredSlots(): StudioSlot[] {
  return [...registeredSlots].sort((a, b) => (a.priority ?? 10) - (b.priority ?? 10));
}

export function getRegisteredRoutes(): StudioRoute[] {
  return [...registeredRoutes];
}

export function clearStudioRegistrations(): void {
  registeredSlots.length = 0;
  registeredRoutes.length = 0;
}

export const STUDIO_SLOTS = {
  SIDEBAR_NAV: "sidebar.nav",
  DASHBOARD_WIDGET: "dashboard.widget",
  CONTENT_EDITOR_TOOLBAR: "content.editor.toolbar",
  USER_PROFILE_TAB: "user.profile.tab",
  SETTINGS_SECTION: "settings.section",
} as const;
