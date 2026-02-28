import { useAppTheme } from "@/theme/context"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"
import React, {
    FC,
    PropsWithChildren,
    useCallback,
    useImperativeHandle,
    useState
} from "react"
import {
    Dimensions,
    Modal,
    Pressable,
    StyleSheet,
    ViewStyle,
} from "react-native"
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"

const ANIMATION_DURATION = 300
const { width: SCREEN_WIDTH } = Dimensions.get("window")

// ─── Public handle ────────────────────────────────────────────────────────────

export type SideSheetModalHandle = {
    present: () => void
    dismiss: () => void
}

// ─── Props ────────────────────────────────────────────────────────────────────

export type SideSheetModalFactoryProps = PropsWithChildren<{
    /** Pass a ref typed as SideSheetModalHandle to control the sheet imperatively. */
    reference: React.RefObject<SideSheetModalHandle | null>
    /** Width of the sheet. Defaults to 80% of screen width. */
    sheetWidth?: number
    /** Extra style applied to the sheet container. */
    contentContainerStyle?: ViewStyle | ViewStyle[]
    /** Called after the sheet has fully closed. */
    onDismiss?: () => void
    /** Direction the sheet opens from. 'right' (default) or 'left'. */
    direction?: "left" | "right"
}>

// ─── Backdrop ─────────────────────────────────────────────────────────────────

const SideSheetBackdrop: FC<{
    opacity: Animated.SharedValue<number>
    overlayColor: string
    onPress: () => void
}> = ({ opacity, overlayColor, onPress }) => {
    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }))

    return (
        <Pressable style={StyleSheet.absoluteFill} onPress={onPress}>
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: overlayColor },
                    animatedStyle,
                ]}
            />
        </Pressable>
    )
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export const SideSheetModalFactory: FC<SideSheetModalFactoryProps> = ({
    reference,
    children,
    sheetWidth = SCREEN_WIDTH * 0.8,
    contentContainerStyle,
    onDismiss,
    direction = "right",
}) => {
    const { theme } = useAppTheme()

    const [visible, setVisible] = useState(false)

    // Shared values: 0 = hidden, 1 = fully visible
    const progress = useSharedValue(0)

    // ── Animate in ──────────────────────────────────────────────────────────
    const animateIn = useCallback(() => {
        setVisible(true)
        progress.value = withTiming(1, {
            duration: ANIMATION_DURATION,
            easing: Easing.out(Easing.cubic),
        })
    }, [progress])

    // ── Animate out ─────────────────────────────────────────────────────────
    const animateOut = useCallback(() => {
        progress.value = withTiming(
            0,
            { duration: ANIMATION_DURATION, easing: Easing.in(Easing.cubic) },
            (finished) => {
                if (finished) {
                    runOnJS(setVisible)(false)
                    if (onDismiss) runOnJS(onDismiss)()
                }
            }
        )
    }, [progress, onDismiss])

    // ── Imperative handle ───────────────────────────────────────────────────
    useImperativeHandle(
        reference,
        () => ({
            present: animateIn,
            dismiss: animateOut,
        }),
        [animateIn, animateOut]
    )

    // ── Animated styles ─────────────────────────────────────────────────────
    const directionMultiplier = direction === "right" ? 1 : -1
    const sheetAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX: directionMultiplier * (1 - progress.value) * sheetWidth,
            },
        ],
    }))

    const backdropOpacity = useSharedValue(0)
    // Mirror progress → backdropOpacity so backdrop drives from the same value
    useAnimatedStyle(() => {
        backdropOpacity.value = progress.value
        return {}
    })

    const containerSafeAreaInsets = useSafeAreaInsetsStyle(["top", "bottom"])

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={animateOut}
        >
            {/* Backdrop */}
            <SideSheetBackdrop
                opacity={backdropOpacity}
                overlayColor={theme.colors.backgrounds.overlay}
                onPress={animateOut}
            />

            {/* Sheet */}
            <Animated.View
                style={[
                    styles.sheet,
                    containerSafeAreaInsets,
                    // Position and visual tweaks depend on open direction
                    direction === "right" ? { right: 0 } : { left: 0 },
                    {
                        width: sheetWidth,
                        backgroundColor: theme.colors.backgrounds.elevated,
                        shadowColor: theme.colors.shadows?.default ?? "#000",
                        shadowOffset: { width: direction === "right" ? -4 : 4, height: 0 },
                    },
                    sheetAnimatedStyle,
                    contentContainerStyle,
                ]}
            >
                {children}
            </Animated.View>
        </Modal>
    )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    sheet: {
        position: "absolute",
        top: 0,
        bottom: 0,
        paddingHorizontal: 24,
        // Shadow (iOS)
        
        shadowOpacity: 0.18,
        shadowRadius: 16,
        // Elevation (Android)
        elevation: 24,
    },
})