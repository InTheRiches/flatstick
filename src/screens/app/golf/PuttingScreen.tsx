import React, {FC, useCallback, useEffect, useMemo, useRef, useState} from "react";
import * as Location from "expo-location"
import {ActivityIndicator, FlatList, TextInput, type TextStyle, View, type ViewStyle} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import type {ThemedStyle} from "@/theme/types";
import {useAppTheme} from "@/theme/context";
import { Screen } from "@/components/ui/Screen"
import {ClubResult, makeCancelableCourseSearch} from "@/services/courses/courseSearching";
import {Text} from "@/components/ui/Text";
import {$styles} from "@/theme/styles";
import CourseRowComponent from "@/components/app/golf/search/CourseRow";
import SelectCourseDetailsModal, {type SelectCourseDetailsModalReference, type CourseSelectionDetails} from "@/components/app/golf/modals/SelectCourseDetailsModal";
import PageHeader from "@/components/headers/PageHeader";

export const PuttingScreen: FC = function PuttingScreen() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null)
    const { themed, theme } = useAppTheme()
    const [loading, setLoading] = useState(false)
    // const modalRef = useRef<SelectCourseDetailsModalReference>(null)

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== "granted") return

            const loc = await Location.getCurrentPositionAsync({})
            setLocation(loc)
        })()
    }, [])

    return (
        <Screen>
            <PageHeader title={"Choose Course"} />

            {loading && <ActivityIndicator color={theme.colors.tint} style={{marginTop: 12}} />}
        </Screen>
    )
}

// {location && (
//     <MapView
//         style={{ height: 200, borderRadius: 16 }}
//         initialRegion={{
//             latitude: location.coords.latitude,
//             longitude: location.coords.longitude,
//             latitudeDelta: 0.1,
//             longitudeDelta: 0.1,
//         }}
//         showsUserLocation
//     >
//         {courses.map((course) => (
//             <Marker
//                 key={course.id}
//                 coordinate={{
//                     latitude: course.lat,
//                     longitude: course.lng,
//                 }}
//                 title={course.name}
//             />
//         ))}
//     </MapView>
// )}