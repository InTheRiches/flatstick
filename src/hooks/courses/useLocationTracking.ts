import type { LatLng } from "@/models/geo";
import { useEffect, useState } from "react";

export function useLocationTracking() {
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // useEffect(() => {
  //   let subscription: Location.LocationSubscription | null = null;

  //   (async () => {
  //     const { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== "granted") {
  //       setErrorMsg("Permission to access location was denied");
  //       return;
  //     }

  //     subscription = await Location.watchPositionAsync(
  //       {
  //         accuracy: Location.Accuracy.Highest,
  //         timeInterval: 2000,
  //         distanceInterval: 1,
  //       },
  //       (location) => {
  //         setUserLocation({
  //           latitude: location.coords.latitude,
  //           longitude: location.coords.longitude,
  //         });
  //       }
  //     );
  //   })();

  //   return () => {
  //     if (subscription) {
  //       subscription.remove();
  //     }
  //   };
  // }, []);

  useEffect(() => {
    setUserLocation({
      latitude: 42.20354936647385,
      longitude: -85.6301051197833
    })
  }, []);

  return { userLocation, errorMsg, setLocation: setUserLocation };
}
