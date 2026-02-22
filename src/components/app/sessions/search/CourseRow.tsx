import React, { FC } from "react"
import { Pressable, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { ThemedStyle } from "@/theme/types"
import { useAppTheme } from "@/theme/context"
import { Text } from "@/components/ui/Text"
import type { ClubResult } from "@/services/courses/courseSearching"

interface CourseRowProps {
    item: ClubResult
    onSelect?: (id: string) => void
}

export const CourseRow: FC<CourseRowProps> = ({ item, onSelect }) => {
    const { themed, theme } = useAppTheme()

    const courseCount = item.courses?.length ?? 0
    const firstCourseName = item.courses?.[0]?.courseName

    // Build subtitle: prefer city + state (from first course raw data), else fall back to course name/count
    const firstRaw = item.courses?.[0]?.raw as any | undefined

    const maybeCity =
        firstRaw?.city ||
        firstRaw?.town ||
        firstRaw?.location?.city ||
        firstRaw?.address?.city ||
        firstRaw?.municipality ||
        undefined

    const maybeState =
        firstRaw?.state ||
        firstRaw?.state_code ||
        firstRaw?.region ||
        firstRaw?.address?.state ||
        firstRaw?.location?.state ||
        undefined

    let subtitle: string
    if (maybeCity && maybeState) {
        subtitle = `${String(maybeCity).trim()}, ${String(maybeState).trim()}`
    } else if (maybeCity) {
        subtitle = String(maybeCity).trim()
    } else {
        // no city/state: prefer first course name, else course count
        if (firstCourseName) subtitle = firstCourseName
        else subtitle = `${courseCount} course${courseCount === 1 ? "" : "s"}`
    }

    return (
        <Pressable
            onPress={() => onSelect?.(item.id)}
            style={({ pressed }) => [
                themed($row),
                pressed && themed($rowPressed),
            ]}
        >
            <View style={themed($leftIcon)}>
                <View style={themed($badge)}>
                    <Ionicons name="map" size={16} color={theme.colors.text} />
                </View>
            </View>

            <View style={themed($textCol)}>
                <Text style={themed($title)} numberOfLines={2} ellipsizeMode={"tail"}>
                    {item.clubName}
                </Text>

                <Text style={themed($subtitle)} numberOfLines={1}>
                    {subtitle}
                </Text>
            </View>

            <View style={themed($rightCol)}>
                {typeof item.distanceMi === "number" ? (
                    <View style={themed($distanceBadge)}>
                        <Ionicons name="location-outline" size={12} color={theme.colors.backgrounds.elevated} />
                        <Text style={themed($distanceText)}>{item.distanceMi} mi</Text>
                    </View>
                ) : (
                    <View style={themed($spacer)} />
                )}
            </View>
        </Pressable>
    )
}

const $row: ThemedStyle<any> = (theme) => ({
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.xs,
    paddingLeft: theme.spacing.xs,
    paddingRight: theme.spacing.sm,
    backgroundColor: theme.colors.backgrounds.elevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    marginBottom: theme.spacing.xxs,
})

const $rowPressed: ThemedStyle<any> = (theme) => ({
    opacity: 0.85,
    borderColor: theme.colors.tint
})

const $leftIcon: ThemedStyle<any> = () => ({ width: 44, alignItems: "center", justifyContent: "center" })

const $badge: ThemedStyle<any> = (theme) => ({
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.backgrounds.elevated,
})

const $textCol: ThemedStyle<any> = () => ({ flex: 1, minWidth: 0 })

const $title: ThemedStyle<any> = (theme) => ({ color: theme.colors.text, fontSize: 16, fontWeight: "700" })
const $subtitle: ThemedStyle<any> = (theme) => ({ color: theme.colors.textDim, fontSize: 13, marginTop: -4 })

const $rightCol: ThemedStyle<any> = (theme) => ({ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm })

const $distanceBadge: ThemedStyle<any> = (theme) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    height: 28,
    borderRadius: 999,
    backgroundColor: theme.colors.tint,
})

const $distanceText: ThemedStyle<any> = (theme) => ({ color: theme.colors.backgrounds.elevated, fontSize: 12, fontWeight: "700" })

const $spacer: ThemedStyle<any> = () => ({ width: 1 })

export default CourseRow
