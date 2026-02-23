import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
    ActivityIndicator,
    Modal,
    Pressable,
    type TextStyle,
    View,
    type ViewStyle,
} from "react-native"
import MapView, { Callout, Marker, type Region } from "react-native-maps"
import { Ionicons } from "@expo/vector-icons"
import {searchGolfClubsWithVariants} from "@/services/courses/courseSearching"
import { searchNearbyGolfCourses } from "@/services/courses/courseSearching"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { Text } from "@/components/ui/Text"
import {ClubResult, OverpassResult} from "@/models/courses";
import {LatLng} from "@/models/common";

interface NearbyCoursesMapProps {
    userCoords: LatLng | null
    onClubPress: (club: ClubResult) => void
    /** optional controlled collapsed state */
    collapsed?: boolean
    /** called when collapsed changes */
    onCollapseChange?: (collapsed: boolean) => void
}

export const NearbyCoursesMap: FC<NearbyCoursesMapProps> = ({
    userCoords,
    onClubPress,
    collapsed: collapsedProp,
    onCollapseChange,
}) => {
    const { themed, theme } = useAppTheme()

    // controlled / uncontrolled collapsed state
    const isControlled = collapsedProp !== undefined
    const [localCollapsed, setLocalCollapsed] = useState(false)
    const collapsed = isControlled ? (collapsedProp as boolean) : localCollapsed

    const toggleCollapsed = () => {
        const next = !collapsed
        if (!isControlled) setLocalCollapsed(next)
        onCollapseChange?.(next)
    }

    const mapRef = useRef<MapView>(null)
    const [nearbyResults, setNearbyResults] = useState<OverpassResult[]>([])
    const [loadingMap, setLoadingMap] = useState(false)

    // Per-marker loading: osmId of the marker currently being fetched
    const [fetchingOsmId, setFetchingOsmId] = useState<string | null>(null)

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const abortRef = useRef<AbortController | null>(null)

    // ── Map bounds search ──────────────────────────────────────────────────────
    const searchCurrentBounds = useCallback(async () => {
        if (!mapRef.current) return

        // Cancel any previous in-flight request
        abortRef.current?.abort()
        const controller = new AbortController()
        abortRef.current = controller

        const bounds = await mapRef.current.getMapBoundaries()
        if (!bounds) return

        setLoadingMap(true)
        try {
            const results = await searchNearbyGolfCourses({
                south: bounds.southWest.latitude,
                west: bounds.southWest.longitude,
                north: bounds.northEast.latitude,
                east: bounds.northEast.longitude,
                userLocation: userCoords,
                signal: controller.signal,
                limit: 60,
            })
            if (!controller.signal.aborted) setNearbyResults(results)
        } catch {
            // ignore AbortError / network errors
        } finally {
            if (!controller.signal.aborted) setLoadingMap(false)
        }
    }, [userCoords])

    /**
     * Debounced wrapper so rapid region changes don't spam the API.
     */
    const debouncedSearch = useCallback(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(searchCurrentBounds, 450)
    }, [searchCurrentBounds])

    // Kick off an initial search once the map is ready and we have coords.
    // We do this via a short delay to let the map finish its layout.
    useEffect(() => {
        if (!userCoords) return
        const t = setTimeout(searchCurrentBounds, 600)
        return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // only on mount – subsequent searches are driven by onRegionChangeComplete

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
            abortRef.current?.abort()
        }
    }, [])

    // ── On-demand Golf API fetch when a marker is pressed ──────────────────────
    const handleMarkerPress = useCallback(async (result: OverpassResult) => {
        setFetchingOsmId(result.osmId)
        try {
            const clubs = await searchGolfClubsWithVariants({
                userQuery: result.name,
                userLocation: userCoords,
                limit: 5,
            })

            if (clubs.length === 0) {
                console.warn("cant find a course")
                // No Golf API match – synthesise a minimal ClubResult from Overpass data
                const fallback: ClubResult = {
                    clubName: result.name,
                    distanceMi: result.distanceMi,
                    distanceKm: result.distanceKm,
                    id: result.osmId,
                    courses: [{
                        id: result.osmId,
                        courseName: undefined,
                        location: result.coordinate,
                        tees: { male: [], female: [] },
                        raw: {},
                    }],
                }
                onClubPress(fallback)
            } else {
                // Pick the best match: prefer exact or closest name match
                const lower = result.name.toLowerCase()
                const best =
                    clubs.find(c => c.clubName.toLowerCase().includes(lower)) ??
                    clubs.find(c => lower.includes(c.clubName.toLowerCase())) ??
                    clubs[0]
                onClubPress(best)
            }
        } catch (e: any) {
            if (e?.name === "AbortError") return
            console.warn("Golf API lookup failed:", e)
        } finally {
            setFetchingOsmId(null)
        }
    }, [userCoords, onClubPress])

    const mapRegion = useMemo((): Region | undefined => {
        if (!userCoords) return undefined
        return {
            latitude: userCoords.latitude,
            longitude: userCoords.longitude,
            latitudeDelta: 0.15,
            longitudeDelta: 0.15,
        }
    }, [userCoords])

    return (
        <View style={themed($card)}>
            {/* ── Header ───────────────────────────────────────────────────── */}
            <Pressable
                style={themed($header)}
                onPress={toggleCollapsed}
                accessibilityRole="button"
                accessibilityLabel={collapsed ? "Expand map" : "Collapse map"}
            >
                <View style={$headerLeft}>
                    <Ionicons name="map-outline" size={16} color={theme.colors.tint} style={$iconGap} />
                    <Text style={themed($title)}>Nearby Courses</Text>

                    {loadingMap && (
                        <ActivityIndicator size="small" color={theme.colors.textDim} style={$spinnerGap} />
                    )}

                    {!loadingMap && nearbyResults.length > 0 && (
                        <View style={themed($badge)}>
                            <Text style={themed($badgeText)}>{nearbyResults.length}</Text>
                        </View>
                    )}
                </View>

                <Ionicons
                    name={collapsed ? "chevron-down" : "chevron-up"}
                    size={18}
                    color={theme.colors.textDim}
                />
            </Pressable>

            {/* ── Map ──────────────────────────────────────────────────────── */}
            {!collapsed && (
                mapRegion ? (
                    <MapView
                        ref={mapRef}
                        style={$map}
                        initialRegion={mapRegion}
                        showsUserLocation
                        showsMyLocationButton={false}
                        onRegionChangeComplete={debouncedSearch}
                    >
                        {nearbyResults.map((result) => (
                            <Marker
                                key={result.osmId}
                                coordinate={result.coordinate}
                                pinColor={theme.colors.tint}
                                onPress={() => handleMarkerPress(result)}
                            >
                                {/* Persistent label shown below the pin */}
                                <Callout tooltip={false}>
                                    <View style={$calloutBox}>
                                        <Text style={$calloutTitle} numberOfLines={2}>
                                            {result.name}
                                        </Text>
                                        {result.distanceMi != null && (
                                            <Text style={$calloutSub}>
                                                {result.distanceMi} mi
                                            </Text>
                                        )}
                                    </View>
                                </Callout>
                            </Marker>
                        ))}
                    </MapView>
                ) : (
                    <View style={themed($placeholder)}>
                        <Ionicons name="location-outline" size={24} color={theme.colors.textDim} />
                        <Text style={themed($placeholderText)}>
                            Enable location to see nearby courses
                        </Text>
                    </View>
                )
            )}

            {/* ── Per-marker loading overlay ────────────────────────────────── */}
            <Modal visible={fetchingOsmId !== null} transparent animationType="fade">
                <View style={$loadingOverlay}>
                    <View style={themed($loadingCard)}>
                        <ActivityIndicator size="large" color={theme.colors.tint} />
                        <Text style={themed($loadingText)}>Loading course info…</Text>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const $card: ThemedStyle<ViewStyle> = (theme) => ({
    marginTop: 12,
    backgroundColor: theme.colors.backgrounds.elevated,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
})

const $header: ThemedStyle<ViewStyle> = () => ({
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
})

const $headerLeft: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
}

const $title: ThemedStyle<TextStyle> = (theme) => ({
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "600",
})

const $badge: ThemedStyle<ViewStyle> = (theme) => ({
    backgroundColor: theme.colors.tint,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
})

const $badgeText: ThemedStyle<TextStyle> = () => ({
    color: "#fff",
    fontSize: 11,
    marginTop: -4,
    fontWeight: "700",
})

const $placeholder: ThemedStyle<ViewStyle> = () => ({
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
})

const $placeholderText: ThemedStyle<TextStyle> = (theme) => ({
    color: theme.colors.textDim,
    fontSize: 13,
})

const $map: ViewStyle = { height: 260 }

const $iconGap = { marginRight: 2 } as const
const $spinnerGap = { marginLeft: 4 } as const

// Callout bubble
const $calloutBox: ViewStyle = {
    backgroundColor: "#fff",
    maxWidth: 160
}

const $calloutTitle: TextStyle = {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a1a1a",
    textAlign: "center",
}

const $calloutSub: TextStyle = {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
    marginTop: 2,
}

// Loading modal
const $loadingOverlay: ViewStyle = {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
}

const $loadingCard: ThemedStyle<ViewStyle> = (theme) => ({
    backgroundColor: theme.colors.backgrounds.elevated,
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 40,
    alignItems: "center",
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
})

const $loadingText: ThemedStyle<TextStyle> = (theme) => ({
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "500",
})
