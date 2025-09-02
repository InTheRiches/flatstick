import * as Location from "expo-location";
import {useEffect, useState} from "react";

export default function useUserLocation() {
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        let subscription;

        (async () => {
            try {
                const { status } = await Location.getForegroundPermissionsAsync();
                if (status !== "granted") {
                    const {secondStatus} = await Location.requestForegroundPermissionsAsync();
                    if (secondStatus !== "granted") {
                        console.warn("Location permission denied");
                        return;
                    }
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

    return {"latitude": 42.203252532938336, "longitude": -85.6281164443875}; //userLocation;
}