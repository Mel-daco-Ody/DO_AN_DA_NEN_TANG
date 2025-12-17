// Lightweight safe wrapper around expo-haptics that no-ops on unsupported platforms (web)
// Export a default object matching the expo-haptics API used in the app.

type HapticsShape = {
  selectionAsync: () => Promise<void>;
  impactAsync: (style?: any) => Promise<void>;
  notificationAsync: (type?: any) => Promise<void>;
  ImpactFeedbackStyle: any;
  NotificationFeedbackType: any;
};

const NOOP = async () => {};

const fallback = {
  selectionAsync: NOOP,
  impactAsync: NOOP,
  notificationAsync: NOOP,
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
} as HapticsShape;

// Mutable object that callers will reference. We attempt to dynamically import
// the real implementation and patch this object when available.
const Haptics: HapticsShape = { ...fallback };

(async () => {
  try {
    const mod = await import('expo-haptics');
    if (mod) {
      // Prefer exported functions if present, otherwise keep fallback
      Haptics.selectionAsync = (mod.selectionAsync as any) ?? Haptics.selectionAsync;
      Haptics.impactAsync = (mod.impactAsync as any) ?? Haptics.impactAsync;
      Haptics.notificationAsync = (mod.notificationAsync as any) ?? Haptics.notificationAsync;
      Haptics.ImpactFeedbackStyle = (mod.ImpactFeedbackStyle as any) ?? Haptics.ImpactFeedbackStyle;
      Haptics.NotificationFeedbackType = (mod.NotificationFeedbackType as any) ?? Haptics.NotificationFeedbackType;
    }
  } catch (e) {
    // If import fails (e.g. web), fall back to no-ops silently.
  }
})();

export default Haptics;
