import * as Location from "expo-location";
import {useEffect, useState} from "react";

export default function useUserLocation(onDenial = () => {}) {
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        let subscription;

        (async () => {
            try {
                const { status } = await Location.getForegroundPermissionsAsync();
                if (status && status !== "granted") {
                    const {secondStatus} = await Location.requestForegroundPermissionsAsync();
                    if (secondStatus && secondStatus !== "granted") {
                        console.warn("Location permission denied");
                        return;
                    }
                }

                const servicesEnabled = await Location.hasServicesEnabledAsync();

                if (!servicesEnabled) {
                    console.warn("Location services are disabled");
                    alert("Location services are disabled. Please enable them in your device settings. Flatstick requires location services to function properly.");
                    onDenial();
                    return;
                }

                // Start watching position
                subscription = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High, // or Balanced if you want less battery drain
                        timeInterval: 1000, // update every 1s
                        distanceInterval: 1, // or update when user moves at least 1 meter
                    },
                    (location) => {
                        setUserLocation({
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        });
                    }
                );
            } catch (e) {
                console.warn("Error getting location:", e);
            }
        })();

        // cleanup when component unmounts
        return () => {
            if (subscription) {
                subscription.remove();
            }
        };
    }, []);

    return userLocation;
}