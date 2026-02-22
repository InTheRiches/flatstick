import {TextStyle, TouchableOpacity, View, ViewStyle} from "react-native";
import FeatherIcon from "@expo/vector-icons/Feather";
import {Text} from "@/components/ui/Text";
import {ThemedStyle} from "@/theme/types";
import {useRouter} from "expo-router";
import {useAppTheme} from "@/theme/context";

export default function PageHeader({ title }: { title: string }) {
    const router = useRouter()
    const {themed, theme} = useAppTheme()

    return (
        <View style={themed($header)}>
            <TouchableOpacity onPress={() => router.back()} style={themed($headerBack)}>
                <FeatherIcon color={theme.colors.text} name="chevron-left" size={30} />
            </TouchableOpacity>
            <Text text={title} style={themed($pageTitle)}/>
            <View style={{ width: 30 }} />
        </View>
    )
}

const $header: ThemedStyle<ViewStyle> = (theme) => ({
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
})

const $headerBack: ThemedStyle<ViewStyle> = (theme) => ({
    padding: theme.spacing.xs,
    marginLeft: -theme.spacing.md,
    marginRight: theme.spacing.md,
})

const $pageTitle: ThemedStyle<TextStyle> = (theme) => ({
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text
})