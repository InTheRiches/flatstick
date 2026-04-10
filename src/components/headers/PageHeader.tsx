import { Text } from "@/components/ui/Text";
import { useAppTheme } from "@/theme/context";
import { ThemedStyle } from "@/theme/types";
import FeatherIcon from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";

export default function PageHeader({ title }: { title: string }) {
    const router = useRouter()
    const {themed, theme} = useAppTheme()

    return (
        <View style={themed($header)}>
            <TouchableOpacity onPress={() => router.back()} style={themed($headerBack)}>
                <FeatherIcon color={theme.colors.text} name="chevron-left" size={30} />
            </TouchableOpacity>
            <Text text={title} style={themed($pageTitle)}/>
        </View>
    )
}

const $header: ThemedStyle<ViewStyle> = (theme) => ({
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
})

const $headerBack: ThemedStyle<ViewStyle> = (theme) => ({
    position: "absolute",
    zIndex: 1,
    padding: theme.spacing.xs,
    left: -theme.spacing.md,
})

const $pageTitle: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
    textAlign: "center",
    width: "100%",
})