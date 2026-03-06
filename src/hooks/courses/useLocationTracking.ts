import type { LatLng } from "@/models/geo";
import { useEffect, useState } from "react";

export function useLocationTracking(disabled: boolean = false) {
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // useEffect(() => {
  //   let subscription: Location.LocationSubscription | null = null;
  //   let active = true;

  //   if (!disabled) {
  //     (async () => {
  //       const { status } = await Location.requestForegroundPermissionsAsync();
  //       if (status !== "granted") {
  //         setErrorMsg("Permission to access location was denied");
  //         return;
  //       }

  //       if (!active) return;

  //       subscription = await Location.watchPositionAsync(
  //         {
  //           accuracy: Location.Accuracy.Highest,
  //           timeInterval: 2000,
  //           distanceInterval: 1,
  //         },
  //         (location) => {
  //           setUserLocation({
  //             latitude: location.coords.latitude,
  //             longitude: location.coords.longitude,
  //           });
  //         }
  //       );

  //       // If the effect was cleaned up while we were awaiting the
  //       // subscription, remove it immediately to avoid a stray watcher.
  //       if (!active && subscription) {
  //         subscription.remove();
  //         subscription = null;
  //       }
  //     })();
  //   }

  //   return () => {
  //     active = false;
  //     if (subscription) {
  //       subscription.remove();
  //     }
  //   };
  // }, [disabled]);

  useEffect(() => {
    setUserLocation({
      latitude: 42.203253685098844, 
      longitude: -85.63197055660751
    })
  }, []);

  return { userLocation, errorMsg, setLocation: setUserLocation };
}
