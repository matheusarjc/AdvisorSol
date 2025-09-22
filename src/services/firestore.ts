import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";

export interface DashboardWidget {
  id: string;
  title: string;
  description: string;
  category: "market" | "macro" | "risk" | "custom";
  enabled: boolean;
  order: number;
  size: "small" | "medium" | "large";
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: "pt" | "en";
  notifications: {
    priceAlerts: boolean;
    marketUpdates: boolean;
    news: boolean;
  };
  dashboard: {
    layout: "grid" | "list";
    autoRefresh: boolean;
    refreshInterval: number;
  };
}

export interface PriceAlert {
  id: string;
  symbol: string;
  condition: "above" | "below";
  targetPrice: number;
  currentPrice: number;
  isActive: boolean;
  createdAt: Date;
  triggeredAt?: Date;
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  addedAt: Date;
  notes?: string;
}

// Dashboard Widgets
export async function loadUserDashboardWidgets(userId: string): Promise<DashboardWidget[] | null> {
  try {
    const docRef = doc(db, "users", userId, "preferences", "dashboard");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().widgets || [];
    }
    return null;
  } catch (error) {
    console.error("Error loading dashboard widgets:", error);
    return null;
  }
}

export async function saveUserDashboardWidgets(
  userId: string,
  widgets: DashboardWidget[]
): Promise<void> {
  try {
    const docRef = doc(db, "users", userId, "preferences", "dashboard");
    await setDoc(docRef, { widgets }, { merge: true });
  } catch (error) {
    console.error("Error saving dashboard widgets:", error);
    throw error;
  }
}

// User Preferences
export async function loadUserPreferences(userId: string): Promise<UserPreferences | null> {
  try {
    const docRef = doc(db, "users", userId, "preferences", "settings");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserPreferences;
    }
    return null;
  } catch (error) {
    console.error("Error loading user preferences:", error);
    return null;
  }
}

export async function saveUserPreferences(
  userId: string,
  preferences: Partial<UserPreferences>
): Promise<void> {
  try {
    const docRef = doc(db, "users", userId, "preferences", "settings");
    await setDoc(docRef, preferences, { merge: true });
  } catch (error) {
    console.error("Error saving user preferences:", error);
    throw error;
  }
}

// Price Alerts
export async function loadUserPriceAlerts(userId: string): Promise<PriceAlert[]> {
  try {
    const alertsRef = collection(db, "users", userId, "priceAlerts");
    const q = query(alertsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      triggeredAt: doc.data().triggeredAt?.toDate(),
    })) as PriceAlert[];
  } catch (error) {
    console.error("Error loading price alerts:", error);
    return [];
  }
}

export async function savePriceAlert(
  userId: string,
  alert: Omit<PriceAlert, "id">
): Promise<string> {
  try {
    const alertsRef = collection(db, "users", userId, "priceAlerts");
    const docRef = doc(alertsRef);
    await setDoc(docRef, {
      ...alert,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving price alert:", error);
    throw error;
  }
}

export async function updatePriceAlert(
  userId: string,
  alertId: string,
  updates: Partial<PriceAlert>
): Promise<void> {
  try {
    const docRef = doc(db, "users", userId, "priceAlerts", alertId);
    await setDoc(docRef, updates, { merge: true });
  } catch (error) {
    console.error("Error updating price alert:", error);
    throw error;
  }
}

export async function deletePriceAlert(userId: string, alertId: string): Promise<void> {
  try {
    const docRef = doc(db, "users", userId, "priceAlerts", alertId);
    await setDoc(docRef, { isActive: false }, { merge: true });
  } catch (error) {
    console.error("Error deleting price alert:", error);
    throw error;
  }
}

// Watchlist
export async function loadUserWatchlist(userId: string): Promise<WatchlistItem[]> {
  try {
    const watchlistRef = collection(db, "users", userId, "watchlist");
    const q = query(watchlistRef, orderBy("addedAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      addedAt: doc.data().addedAt?.toDate() || new Date(),
    })) as WatchlistItem[];
  } catch (error) {
    console.error("Error loading watchlist:", error);
    return [];
  }
}

export async function addToWatchlist(
  userId: string,
  item: Omit<WatchlistItem, "id">
): Promise<string> {
  try {
    const watchlistRef = collection(db, "users", userId, "watchlist");
    const docRef = doc(watchlistRef);
    await setDoc(docRef, {
      ...item,
      addedAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    throw error;
  }
}

export async function removeFromWatchlist(userId: string, itemId: string): Promise<void> {
  try {
    const docRef = doc(db, "users", userId, "watchlist", itemId);
    await setDoc(docRef, { deleted: true }, { merge: true });
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    throw error;
  }
}

// Analytics and Usage
export async function logUserActivity(
  userId: string,
  activity: {
    type: string;
    data?: any;
    timestamp?: Date;
  }
): Promise<void> {
  try {
    const activityRef = collection(db, "users", userId, "activity");
    const docRef = doc(activityRef);
    await setDoc(docRef, {
      ...activity,
      timestamp: activity.timestamp || new Date(),
    });
  } catch (error) {
    console.error("Error logging user activity:", error);
    // Don't throw error for analytics logging
  }
}
