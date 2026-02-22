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
import CourseRowComponent from "@/components/app/sessions/search/CourseRow";
import SelectCourseDetailsModal, {type SelectCourseDetailsModalReference, type CourseSelectionDetails} from "@/components/app/sessions/modals/SelectCourseDetailsModal";

export const SearchCoursesScreen: FC = function SearchCoursesScreen() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null)
    const { themed, theme } = useAppTheme()
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<ClubResult[]>([])
    const [loading, setLoading] = useState(false)
    const modalRef = useRef<SelectCourseDetailsModalReference>(null)

    const search = useMemo(() => makeCancelableCourseSearch(), [])

    const handleClubSelect = useCallback((club: ClubResult) => {
        modalRef.current?.setClub(club)
        modalRef.current?.open()
    }, [])

    const handleCourseDetailsConfirm = useCallback((details: CourseSelectionDetails) => {
        console.log("Course details confirmed:", details)
        // TODO: Navigate to next screen or save selection
    }, [])

    useEffect(() => {
        let mounted = true
        if (query.trim().length < 2) {
            setResults([])
            setLoading(false)
            return
        }

        setLoading(true)
        const t = setTimeout(async () => {
            try {
                // Build minimal LatLng if we have a location so the search can compute/sort by distance
                const userLoc = location ? { latitude: location.coords.latitude, longitude: location.coords.longitude } : undefined
                const res = await search(query, userLoc)
                if (!mounted) return
                setResults(res)
            } catch (e) {
                console.warn("Course search failed", e)
            } finally {
                if (mounted) setLoading(false)
            }
        }, 250)

        return () => {
            mounted = false
            clearTimeout(t)
        }
    }, [query, search, location])

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== "granted") return

            const loc = await Location.getCurrentPositionAsync({})
            setLocation(loc)
        })()
    }, [])

    const renderItem = useCallback(({ item }: { item: ClubResult }) => (
        <CourseRowComponent item={item} onSelect={() => handleClubSelect(item)} />
    ), [handleClubSelect])

    return (
        <Screen>
            <Text style={$styles.sectionHeader}>Choose Course</Text>
            <View style={themed($searchContainer)}>
                <Ionicons name="search" size={16} color={theme.colors.textDim} style={themed($icon)} />
                <TextInput
                    style={themed($input)}
                    value={query}
                    onChangeText={setQuery}
                    placeholder={"Search courses..."}
                    placeholderTextColor={theme.colors.textDim}
                    returnKeyType="search"
                    autoCapitalize="none"
                    autoCorrect={false}
                    clearButtonMode="while-editing"
                />
            </View>

            {loading && <ActivityIndicator color={theme.colors.tint} style={{marginTop: 12}} />}

            {!loading && results.length === 0 && query.trim().length >= 2 && (
                <Text style={themed($empty)}>No courses found.</Text>
            )}

            <FlatList
                data={results}
                keyExtractor={(i) => i.id}
                renderItem={renderItem}
                style={{width: "100%", marginTop: 12}}
                contentContainerStyle={{paddingBottom: 80}}
            />

            <SelectCourseDetailsModal reference={modalRef} onConfirm={handleCourseDetailsConfirm} />
        </Screen>
    )
}

const $searchContainer: ThemedStyle<ViewStyle> = (theme) => ({
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
    backgroundColor: theme.colors.backgrounds.elevated
})

const $icon: ThemedStyle<TextStyle> = () => ({
    marginRight: 8,
})

const $input: ThemedStyle<TextStyle> = (theme) => ({
    flex: 1,
    color: theme.colors.text,
    fontSize: 16
})

const $empty = (theme: any) => ({
    marginTop: 16,
    color: theme.colors.textDim,
})

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