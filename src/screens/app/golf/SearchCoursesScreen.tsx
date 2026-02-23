import React, {FC, useCallback, useEffect, useMemo, useRef, useState} from "react"
import * as Location from "expo-location"
import {ActivityIndicator, FlatList, TextInput, type TextStyle, View, type ViewStyle} from "react-native"
import {Ionicons} from "@expo/vector-icons"
import type {ThemedStyle} from "@/theme/types"
import {useAppTheme} from "@/theme/context"
import {Screen} from "@/components/ui/Screen"
import {makeCancelableCourseSearch} from "@/services/courses/courseSearching"
import {Text} from "@/components/ui/Text"
import CourseRowComponent from "@/components/app/golf/search/CourseRow"
import {NearbyCoursesMap} from "@/components/app/golf/search/NearbyCoursesMap"
import SelectCourseDetailsModal, {
    type SelectCourseDetailsModalReference,
    type CourseSelectionDetails,
} from "@/components/app/golf/modals/SelectCourseDetailsModal"
import PageHeader from "@/components/headers/PageHeader"
import {normalizeUserQueryForGolfAPI} from "@/utils/searching";
import {useNavPayloadStore} from "@/hooks/useNavPayloadStore";
import {useRouter} from "expo-router";
import {ClubResult} from "@/models/courses";

export const SearchCoursesScreen: FC = function SearchCoursesScreen() {
    const {themed, theme} = useAppTheme()
    const router = useRouter()

    const [location, setLocation] = useState<Location.LocationObject | null>(null)
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<ClubResult[]>([])
    const [loading, setLoading] = useState(false)
    const [mapCollapsed, setMapCollapsed] = useState(false)

    const modalRef = useRef<SelectCourseDetailsModalReference>(null)
    const search = useMemo(() => makeCancelableCourseSearch(), [])

    // ── Acquire location ──────────────────────────────────────────────────────
    useEffect(() => {
        ;(async () => {
            const {status} = await Location.requestForegroundPermissionsAsync()
            if (status !== "granted") return
            const loc = await Location.getCurrentPositionAsync({})
            setLocation(loc)
        })()
    }, [])

    // ── Debounced text search ─────────────────────────────────────────────────
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
                const userLoc = location
                    ? {latitude: location.coords.latitude, longitude: location.coords.longitude}
                    : undefined
                const res = await search(query, userLoc)
                if (!mounted) return
                setResults(res)
            } catch (e) {
                console.warn("Course search failed", e)
            } finally {
                if (mounted) setLoading(false)
            }
        }, 300)

        return () => {
            mounted = false
            clearTimeout(t)
        }
    }, [query, search, location])

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleClubSelect = useCallback((club: ClubResult) => {
        modalRef.current?.setClub(club)
        modalRef.current?.open()
    }, [])

    const handleCourseDetailsConfirm = useCallback((_details: CourseSelectionDetails) => {
        // TODO: navigate / save selection
        const key = `${_details.club.id}:${Date.now()}`
        useNavPayloadStore.getState().setPayload(key, { _details })

        router.push({
            pathname: "/(golf)/putting",
            params: { key }
        })
    }, [])

    const userCoords = useMemo(
        () =>
            location
                ? {latitude: location.coords.latitude, longitude: location.coords.longitude}
                : null,
        [location],
    )

    const renderItem = useCallback(
        ({item}: {item: ClubResult}) => (
            <CourseRowComponent item={item} onSelect={() => handleClubSelect(item)}/>
        ),
        [handleClubSelect],
    )

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <Screen>
            <PageHeader title={"Choose Course"}/>

            <NearbyCoursesMap userCoords={userCoords} onClubPress={handleClubSelect} collapsed={mapCollapsed} onCollapseChange={setMapCollapsed} />

            {/* Search Bar */}
             <View style={themed($searchContainer)}>
                 <Ionicons name="search" size={16} color={theme.colors.textDim} style={$searchIconGap}/>
                 <TextInput
                     style={themed($input)}
                     value={query}
                     onChangeText={setQuery}
                    onFocus={() => setMapCollapsed(true)}
                     placeholder={"Search courses..."}
                     placeholderTextColor={theme.colors.textDim}
                     returnKeyType="search"
                     autoCapitalize="none"
                     autoCorrect={false}
                     clearButtonMode="while-editing"
                 />
             </View>

            {/* List results */}
            {loading && <ActivityIndicator color={theme.colors.tint} style={{marginTop: 12}}/>}

            {!loading && results.length === 0 && query.trim().length >= 2 && (
                <Text style={themed($empty)}>No courses found.</Text>
            )}

            <FlatList
                data={results}
                keyExtractor={(i) => i.id}
                renderItem={renderItem}
                style={{width: "100%", marginTop: 12}}
                contentContainerStyle={{paddingBottom: 80}}
                keyboardShouldPersistTaps="handled"
            />

            <SelectCourseDetailsModal reference={modalRef} onConfirm={handleCourseDetailsConfirm}/>
        </Screen>
    )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const $searchContainer: ThemedStyle<ViewStyle> = (theme) => ({
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
    backgroundColor: theme.colors.backgrounds.elevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
})

const $input: ThemedStyle<TextStyle> = (theme) => ({
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
})

const $empty: ThemedStyle<TextStyle> = (theme) => ({
    marginTop: 16,
    color: theme.colors.textDim,
    textAlign: "center",
})

const $searchIconGap = {marginRight: 8} as const
