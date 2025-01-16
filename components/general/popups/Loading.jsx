import {ActivityIndicator, View} from "react-native";
import useColors from "@/hooks/useColors";

export default function Loading({translucent = false}) {
    const colors = useColors();

    return (
        <View style={{
            width: "100%",
            height: "100%",
            flexDirection: "flow",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.background.primary,
            opacity: translucent ? 0.5 : 1
        }}>
            <ActivityIndicator size="large"/>
        </View>
    )
}