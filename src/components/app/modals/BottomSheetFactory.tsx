import React, {FC, PropsWithChildren, useCallback, useMemo} from "react"
import {BottomSheetModal, BottomSheetView, type BottomSheetBackdropProps} from "@gorhom/bottom-sheet"
import Animated, {Extrapolate, interpolate, useAnimatedStyle} from "react-native-reanimated"
import {Pressable, ViewStyle} from "react-native"
import {useAppTheme} from "@/theme/context"

export type BottomSheetFactoryProps = PropsWithChildren<{
    reference: React.RefObject<BottomSheetModal | null>
    enablePanDownToClose?: boolean
    handleIndicatorStyle?: ViewStyle
    backgroundStyle?: ViewStyle
    contentContainerStyle?: ViewStyle | ViewStyle[]
    snapPoints?: (string | number)[]
}>

/**
 * Shared Custom Backdrop for BottomSheetModal
 */
export const CustomBackdrop: FC<{
    reference: React.RefObject<BottomSheetModal | null>;
    animatedIndex: any;
    style: any
}> = ({reference, animatedIndex, style}) => {
    const {theme} = useAppTheme()

    const containerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(animatedIndex.value, [-1, 0], [0, 1], Extrapolate.CLAMP),
    }))

    const containerStyle = useMemo(
        () => [
            style,
            {
                backgroundColor: theme.colors.backgrounds.overlay,
            },
            containerAnimatedStyle,
        ],
        [style, containerAnimatedStyle, theme.colors.backgrounds.overlay]
    )

    return (
        <Pressable style={style} onPress={() => reference.current?.dismiss()}>
            <Animated.View style={containerStyle}/>
        </Pressable>
    )
}

/**
 * BottomSheetModal wrapper to reduce repetition in modals.
 * Usage: wrap modal content as children and pass a ref.
 */
export const BottomSheetModalFactory: FC<BottomSheetFactoryProps> = ({
                                                                         reference,
                                                                         children,
                                                                         enablePanDownToClose = true,
                                                                         handleIndicatorStyle,
                                                                         backgroundStyle,
                                                                         contentContainerStyle,
                                                                         snapPoints = [],
                                                                     }) => {
    const {theme} = useAppTheme()

    const backdrop = useCallback((props: BottomSheetBackdropProps) => {
        const {animatedIndex, style} = props
        return <CustomBackdrop reference={reference} animatedIndex={animatedIndex} style={style}/>
    }, [reference])

    return (
        <BottomSheetModal
            ref={reference}
            snapPoints={snapPoints}
            enableDynamicSizing={snapPoints.length === 0}
            enablePanDownToClose={enablePanDownToClose}
            backdropComponent={backdrop}
            handleIndicatorStyle={handleIndicatorStyle}
            backgroundStyle={backgroundStyle ?? {backgroundColor: theme.colors.backgrounds.elevated}}
        >
            <BottomSheetView
                style={[{paddingBottom: 36, backgroundColor: theme.colors.backgrounds.elevated, paddingHorizontal: 24}, contentContainerStyle]}>
                {children}
            </BottomSheetView>
        </BottomSheetModal>
    )
}
