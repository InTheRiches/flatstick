import {Text, View} from "react-native";
import useColors from "../../hooks/useColors";
import {PrimaryButton} from "../../components/general/buttons/PrimaryButton";
import {useRouter} from "expo-router";

export default function Compare({}) {
    const colors = useColors();
    const router = useRouter();

    return (
        <View style={{backgroundColor: colors.background.primary, flex: 1, alignItems: "center", paddingHorizontal: 24}}>
            <Text style={{fontSize: 18, color: colors.text.primary, marginBottom: 24}}>Compare Your Stats</Text>
            <View style={{flexDirection: "row", gap: 16}}>
                <PrimaryButton onPress={() => router.push({pathname: "/compare/putters"})} style={{borderRadius: 12, paddingVertical: 12, flex: 1}} title={"By Putter"}></PrimaryButton>
                <PrimaryButton style={{borderRadius: 12, paddingVertical: 12, flex: 1}} title={"By User"} onPress={() => router.push({pathname: "/compare/users/search"})}></PrimaryButton>
            </View>
        </View>
    )
}