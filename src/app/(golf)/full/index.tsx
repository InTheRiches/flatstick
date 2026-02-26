import type { CourseSelectionDetails } from "@/components/app/golf/modals/SelectCourseDetailsModal";
import { ActionRow } from "@/components/app/golf/putting/ActionRow";
import { PuttingHeader } from "@/components/app/golf/putting/PuttingHeader";
import {
    computeBounds,
    GreenMap,
    type CourseGreen,
    type PuttTap as GreenPuttTap,
    type PinLocation,
} from "@/components/putting-green";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useCourseData } from "@/hooks/courses/useCourseData";
import { useRoundTimerEngine } from "@/hooks/useTimerEngine";
import type { LatLng } from "@/models/geo";
import { HoleState } from "@/models/session.types";
import type { CourseLoadError } from "@/services/courses/courseLoader";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";
import { Ionicons } from "@expo/vector-icons";
import { getFirestore } from "@react-native-firebase/firestore";
import * as Location from "expo-location";
import React, { FC, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, View, type ViewStyle } from "react-native";

interface PuttingScreenProps {
    course: CourseSelectionDetails | null;
    onCourseLoadError?: (error: CourseLoadError) => void;
}

export const PuttingScreen: FC<PuttingScreenProps> = function PuttingScreen({ course, onCourseLoadError }) {
    const { themed, theme } = useAppTheme()
    const db = getFirestore()

    // Derive a LatLng from the selected course — used to query OSM/Firestore
    const courseLocation: LatLng | null = useMemo(() => {
        const loc = course?.selectedCourse.location
        if (!loc) return null
        return { latitude: loc.latitude, longitude: loc.longitude }
    }, [course?.selectedCourse.location?.latitude, course?.selectedCourse.location?.longitude])

    useEffect(() => {
        console.debug("[PuttingScreen] courseLocation changed", { courseLocation, selectedCourseId: course?.selectedCourse?.id })
    }, [courseLocation, course?.selectedCourse?.id])

    // Load full OSM course dataset for this course
    const courseDataState = useCourseData(courseLocation, db)

    useEffect(() => {
        console.debug("[PuttingScreen] courseDataState change", courseDataState)
        if (courseDataState.status === "success") {
            console.debug("[PuttingScreen] course loaded", { osmId: courseDataState.data.osmId, greens: courseDataState.data.greens.length })
        } else if (courseDataState.status === "error") {
            console.debug("[PuttingScreen] course load error", courseDataState.error)
        }
    }, [courseDataState])

    // Player's real-time GPS position (separate from the course load location)
    const [playerLocation, setPlayerLocation] = useState<Location.LocationObject | null>(null)
    const [isPinEditMode, setIsPinEditMode] = useState(false)

    /** Putt tap markers for the current hole. Reset when the hole number changes. */
    const [puttTaps, setPuttTaps] = useState<GreenPuttTap[]>([])
    /** Pin location(s) placed by the player. Reset when the hole number changes. */
    const [pinLocations, setPinLocations] = useState<PinLocation[]>([])

    const [holeState, setHoleState] = useState<HoleState>({
        holeNumber: 1,
        status: "inProgress",
    } as HoleState)

    const timerEngine = useRoundTimerEngine(course?.numberOfHoles)

    // Notify parent when a course load error occurs so it can show a modal
    useEffect(() => {
        if (courseDataState.status === "error") {
            onCourseLoadError?.(courseDataState.error)
        }
    }, [courseDataState.status === "error" ? courseDataState.error : null])

    // Reset per-hole gameplay state whenever the player moves to a new hole.
    useEffect(() => {
        setPuttTaps([])
        setPinLocations([])
    }, [holeState.holeNumber])

    // Player GPS tracking — used for on-screen position, not course fetching
    useEffect(() => {
        let subscription: { remove: () => void; }

        ;(async () => {
            const { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== "granted") return

            const watchOptions: Location.LocationOptions = {
                accuracy: Location.Accuracy.Highest,
                timeInterval: 2000,
                distanceInterval: 1,
            }

            subscription = await Location.watchPositionAsync(
                watchOptions,
                (loc: Location.LocationObject) => {
                    setPlayerLocation(loc)
                }
            )
        })()

        return () => {
            if (subscription) {
                subscription.remove()
            }
        }
    }, [])

    // ── GreenMap data — computed unconditionally so hooks are never conditional ──
    const successData = courseDataState.status === "success" ? courseDataState.data : null

    /**
     * All greens mapped to CourseGreen format.
     * ProcessedGreen stores vertices as XYPoint (x=lon, y=lat) — we convert to LatLon.
     */
    const courseGreens = useMemo<CourseGreen[]>(() => {
        if (!successData) return []
        return successData.greens.map((green) => ({
            holeNumber: green.hole,
            coords: green.polygon.map((p) => ({ latitude: p.y, longitude: p.x })),
        }))
    }, [successData])

    /** Fairway coordinate arrays — one entry per fairway polygon. */
    const fairwayCoords = useMemo(
        () => successData?.fairways.map((f) => f.coordinates) ?? [],
        [successData]
    )

    /**
     * Course-wide bounding box derived from every green polygon, fairway, and
     * bunker vertex.  The 12 % padding keeps all geometry clear of the edges.
     */
    const courseBounds = useMemo(() => {
        if (!successData || courseGreens.length === 0) return null

        const allPoints: { latitude: number; longitude: number }[] = [
            ...courseGreens.flatMap((g) => g.coords),
            ...fairwayCoords.flatMap((f) => f),
            ...successData.bunkers.flatMap((b) => b.coordinates),
        ]

        if (allPoints.length === 0) return null
        return computeBounds(allPoints, 0.12)
    }, [successData, courseGreens, fairwayCoords])

    /**
     * Player location as a plain LatLon object for GreenMap.
     * Derived from the Expo Location.LocationObject updated by watchPositionAsync.
     */
    const userLatLon = useMemo(() => {
        if (!playerLocation) return null
        return {
            latitude: playerLocation.coords.latitude,
            longitude: playerLocation.coords.longitude,
        }
    }, [playerLocation])

    // ── Loading / idle ──────────────────────────────────────────────────────
    if (courseDataState.status === "idle" || courseDataState.status === "loading") {
        return (
            <Screen>
                <View style={$centeredFill}>
                    <ActivityIndicator size="large" color={theme.colors.tint} />
                    <Text
                        style={{ marginTop: 12, color: theme.colors.textDim, textAlign: "center" }}
                        text={courseDataState.status === "idle" ? "Waiting for course…" : "Loading course data…"}
                    />
                </View>
            </Screen>
        )
    }

    // ── Error — parent is notified via onCourseLoadError ───────────────────
    if (courseDataState.status === "error") {
        return (
            <Screen>
                <View style={$centeredFill}>
                    <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
                    <Text
                        style={{ marginTop: 12, color: theme.colors.textDim, textAlign: "center" }}
                        text="Failed to load course data."
                    />
                </View>
            </Screen>
        )
    }

    // ── Success ─────────────────────────────────────────────────────────────

    return (
        <Screen>
            <PuttingHeader holeState={holeState} timer={timerEngine} teeSet={course?.selectedTee}/>

            <View style={$mapContainer}>
                {courseGreens.length > 0 && courseBounds ? (
                    <GreenMap
                        courseGreens={courseGreens}
                        bounds={courseBounds}
                        currentHoleNumber={holeState.holeNumber}
                        taps={puttTaps}
                        setTaps={setPuttTaps}
                        pinLocations={pinLocations}
                        setPinLocations={setPinLocations}
                        userLocation={userLatLon}
                        bunkers={successData?.bunkers ?? []}
                        fairways={fairwayCoords}
                        showHeading
                    />
                ) : (
                    // Fallback while course geometry is loading or unavailable
                    <View style={$mapFallback} />
                )}

                {/* Pin-edit toggle — overlaid in the top-right corner */}
                <Pressable
                    style={({ pressed }) => [
                        themed($pinButton),
                        isPinEditMode && themed($pinButtonActive),
                        pressed && { opacity: 0.8 },
                    ]}
                    onPress={() => setIsPinEditMode(!isPinEditMode)}
                    hitSlop={8}
                >
                    <Ionicons
                        name="flag"
                        size={20}
                        color={
                            isPinEditMode
                                ? theme.colors.buttons.textColor
                                : theme.colors.buttons.secondary.textColor
                        }
                    />
                </Pressable>
            </View>

            <ActionRow actionLabel={isPinEditMode ? "Edit pin location" : "Add first shot"} onAction={() => {}} onDelete={() => {}} onUndo={() => {}}/>
        </Screen>
    )
}

const $centeredFill: ViewStyle = {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
}

/** Container for the GreenMap + overlaid pin-edit button. */
const $mapContainer: ViewStyle = {
    aspectRatio: 1,
    width: "100%",
    marginTop: 24,
    borderRadius: 16,
    overflow: "hidden",
}

/** Shown when green geometry is not yet available for the current hole. */
const $mapFallback: ViewStyle = {
    flex: 1,
    backgroundColor: "#246903",
    borderRadius: 16,
}

const $pinButtonActive: ThemedStyle<ViewStyle> = (theme) => ({
    backgroundColor: theme.colors.buttons.background,
    borderColor: theme.colors.buttons.background,
})

const $pinButton: ThemedStyle<ViewStyle> = (theme) => ({
    borderRadius: 50,
    backgroundColor: theme.colors.buttons.secondary.background,
    borderColor: theme.colors.buttons.secondary.border,
    padding: 12,
    marginTop: 8,
    marginRight: 8,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    position: "absolute",
    right: 0,
    top: 0
})
