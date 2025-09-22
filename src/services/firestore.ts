// Mock Firestore service for development
// In production, this would use real Firestore

export interface DashboardWidget {
  id: string;
  title: string;
  description: string;
  category: "market" | "macro" | "risk" | "custom";
  enabled: boolean;
  order: number;
  size: "small" | "medium" | "large";
}

// In-memory storage for development
const mockStorage: Record<string, any> = {};

export async function loadUserDashboardWidgets(userId: string): Promise<DashboardWidget[] | null> {
  // Mock implementation - load from memory/localStorage
  const key = `dashboard_widgets_${userId}`;

  // First try memory
  if (mockStorage[key]) {
    return mockStorage[key];
  }

  // Then try localStorage
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(key);
    if (stored) {
      const widgets = JSON.parse(stored);
      mockStorage[key] = widgets; // Cache in memory
      return widgets;
    }
  }

  return null;
}

export async function saveUserDashboardWidgets(
  userId: string,
  widgets: DashboardWidget[]
): Promise<void> {
  // Mock implementation - store in memory/localStorage
  const key = `dashboard_widgets_${userId}`;
  mockStorage[key] = widgets;

  // Also store in localStorage for persistence across reloads
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(widgets));
  }
}
