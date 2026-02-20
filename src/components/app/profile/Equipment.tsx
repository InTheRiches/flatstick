import {useRouter} from "expo-router";
import {useAppTheme} from "@/theme/context";
import {Image, ImageStyle, TextStyle, View, ViewStyle} from "react-native";

import {Text} from "@/components/Text";
import {ThemedStyle} from "@/theme/types";

export function Equipment() {
    const router = useRouter()
    const {themed, theme} = useAppTheme()

    return (
        <View style={$container}>
            <Text style={$title}>Equipment</Text>
            <View style={themed($card)}>
                <View style={themed($section)}>
                    <Text style={themed($subtitle)}>Active Putter</Text>
                    <View style={$innerSection}>
                        <View style={themed($avatar)}>
                            <Image
                                source={require("@assets/branding/FlatstickMallet.png")}
                                resizeMode="contain"
                                style={$image}
                            />
                        </View>
                        <View style={$textContainer}>
                            <Text style={themed($name)}>Scotty Cameron Phantom X5</Text>
                            <Text style={themed($description)}>39 rounds</Text>
                        </View>
                    </View>
                </View>
                <View style={themed($seperator)} />
                <View style={themed($section)}>
                    <Text style={themed($subtitle)}>Active Grip</Text>
                    <View style={$innerSection}>
                        <View style={themed($avatar)}>
                            <Image
                                source={require("@assets/branding/FlatstickMallet.png")}
                                resizeMode="contain"
                                style={$image}
                            />
                        </View>
                        <View style={$textContainer}>
                            <Text style={themed($name)}>Claw Grip</Text>
                            <Text style={themed($description)}>6 rounds</Text>
                        </View>
                    </View>
                </View>
            </View>
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

const $container: ViewStyle = {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
}

const $title: TextStyle = {
    fontSize: 18,
    textAlign: "left",
    width: "100%",
    fontWeight: "700",
}