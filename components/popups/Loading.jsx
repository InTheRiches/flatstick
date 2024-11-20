import {View, ActivityIndicator} from "react-native";
import useColors from "@/hooks/useColors";

export default function Loading({}) {
    const colors = useColors();

    return (
        <View style={{
            width: "100%",
            height: "100%",
            flexDirection: "flow",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.background.primary
        }}>
            <ActivityIndicator size="large"/>
        </View>
    )
}