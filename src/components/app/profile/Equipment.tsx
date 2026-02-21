import {useRouter} from "expo-router";
import {useAppTheme} from "@/theme/context";
import {Image, ImageStyle, Pressable, TextStyle, View, ViewStyle} from "react-native";

import {Text} from "@/components/Text";
import {ThemedStyle} from "@/theme/types";
import {GripDoc, PutterDoc} from "@/models/equipment";
import {$styles} from "@/theme/styles";

interface EquipmentProps {
    selectedPutter?: PutterDoc,
    selectedGrip?: GripDoc
}

export function Equipment({ selectedPutter, selectedGrip }: EquipmentProps) {
    const router = useRouter()
    const {themed} = useAppTheme()

    const putterSubtitle = selectedPutter
        ? (selectedPutter.summary?.totalRounds != null
            ? `${selectedPutter.summary.totalRounds} rounds`
            : (selectedPutter.summary?.totalPutts != null ? `${selectedPutter.summary.totalPutts} putts` : ""))
        : ""

    const gripSubtitle = selectedGrip
        ? (selectedGrip.summary?.totalRounds != null
            ? `${selectedGrip.summary.totalRounds} rounds`
            : "")
        : ""

    return (
        <View style={$container}>
            <Text style={$styles.sectionHeader}>Equipment</Text>
            <Pressable        onPress={() => router.push("/equipment")}
                                       style={({ pressed }) => [themed($card), pressed && themed($cardPressed)]}
                                       accessibilityRole="button"
                                       accessibilityLabel={`Start green simulation mode.`}>
                <View style={themed($section)}>
                    <Text style={themed($subtitle)}>Active Putter</Text>
                    { selectedPutter ? (
                        <View style={$innerSection}>
                            <View style={themed($avatar)}>
                                <Image
                                    source={require("@assets/branding/FlatstickMallet.png")}
                                    resizeMode="contain"
                                    style={$image}
                                />
                            </View>
                            <View style={$textContainer}>
                                <Text style={themed($name)}>{selectedPutter.brand} {selectedPutter.model}</Text>
                                <Text style={themed($description)}>{putterSubtitle}</Text>
                            </View>
                        </View>
                    ) : (
                        <Text style={themed($name)}>No putter selected</Text>
                    )}
                </View>
                <View style={themed($seperator)} />
                <View style={themed($section)}>
                    <Text style={themed($subtitle)}>Active Grip</Text>
                    { selectedGrip ? (
                        <View style={$innerSection}>
                            <View style={themed($avatar)}>
                                <Image
                                    source={require("@assets/branding/FlatstickMallet.png")}
                                    resizeMode="contain"
                                    style={$image}
                                />
                            </View>
                            <View style={$textContainer}>
                                <Text style={themed($name)}>{selectedGrip.name}</Text>
                                <Text style={themed($description)}>{gripSubtitle}</Text>
                            </View>
                        </View>
                    ) : (
                        <Text style={themed($name)}>No grip selected</Text>
                    )}
                </View>
            </Pressable>
        </View>
    )
}

const $seperator: ThemedStyle<ViewStyle> = (theme) => ({
    width: "100%",
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
})

const $description: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 13,
    color: theme.colors.textDim,
    fontWeight: "500",
    marginTop: -6,
})

const $name: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
})

const $textContainer: ViewStyle = {
    marginLeft: 12,
    justifyContent: "center",
    flexDirection: "column",
}

const $innerSection: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
}

const $image: ImageStyle = {
    width: 28,
    height: 28
}

const $avatar: ThemedStyle<ViewStyle> = (theme) => ({
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: theme.colors.backgrounds.elevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
})

const $subtitle: ThemedStyle<TextStyle> = (theme) => ({
    fontWeight: "700",
    color: theme.colors.textDim,
    fontSize: 13
})

const $section: ViewStyle = {
    width: "100%",
    flexDirection: "column"
}

const $card: ThemedStyle<ViewStyle> = (theme) => ({
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 10,
    marginTop: 8,
    backgroundColor: theme.colors.backgrounds.elevated,
    borderColor: theme.colors.border
})

const $cardPressed: ThemedStyle<ViewStyle> = (theme) => ({
    borderColor: theme.colors.tint
})

const $container: ViewStyle = {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
}