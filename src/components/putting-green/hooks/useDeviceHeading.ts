import * as Location from 'expo-location';
import { useEffect } from 'react';
import { useSharedValue } from 'react-native-reanimated';

/**
 * Subscribes to the device compass and exposes the true heading as a
 * Reanimated `SharedValue<number>` (in degrees, 0 = north).
 *
 * The subscription is created only when `enabled` is true and is cleaned
 * up automatically on unmount or when `enabled` changes to false.
 */
export function useDeviceHeading(enabled: boolean) {
  const heading = useSharedValue(0);

  useEffect(() => {
    if (!enabled) return;

    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      subscription = await Location.watchHeadingAsync((data) => {
        if (data.trueHeading != null) {
          heading.value = data.trueHeading;
        }
      });
    })();

    return () => {
      subscription?.remove();
    };
  }, [enabled, heading]);

  return heading;
}
