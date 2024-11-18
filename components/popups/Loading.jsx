import {View, ActivityIndicator} from "react-native";
import {useColorScheme} from "../../hooks/useColorScheme";
import {Colors} from "../../constants/Colors";

export default function Loading({}) {
    const colorScheme = useColorScheme();

    return (
        <View style={{
            width: "100%",
            height: "100%",
            flexDirection: "flow",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: Colors[colorScheme ?? "light"].background
        }}>
            <ActivityIndicator size="large"/>
        </View>
    )
}