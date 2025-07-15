// only 18 hole simulations and real simulations, no other practices
import {Pressable, View} from "react-native";
import useColors from "../../../../hooks/useColors";
import {convertUnits} from "../../../../utils/Conversions";
import {useAppContext} from "../../../../contexts/AppCtx";
import FontText from "../../../general/FontText";
import {useRouter} from "expo-router";

export const RecentSession = ({recentSession}) => {
    const colors = useColors();
    const router = useRouter();

    const formattedName = () => {
        if (recentSession.type === "real-simulation" || recentSession.type === "full-round") {
            return recentSession.holes + " Hole Round";
        } else if (recentSession.type === "round-simulation") {
            return recentSession.holes + " Hole Simulation";
        }
        return "huggidy buggidy"
    }

    return (
        <Pressable onPress={() => router.push({pathname: "sessions/individual", params: {jsonSession: JSON.stringify(recentSession), recap: false}})} style={{backgroundColor: colors.background.secondary, borderWidth: 1, borderColor: colors.border.default, borderRadius: 12, paddingTop: 8}}>
            <View style={{
                paddingHorizontal: 12,
                borderBottomWidth: 1,
                borderColor: colors.border.default,
                paddingBottom: 6,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <FontText style={{
                    fontSize: 16,
                    textAlign: "left",
                    color: colors.text.primary,
                    fontWeight: "bold",
                    flex: 1
                }}>{formattedName()}</FontText>
                <FontText style={{
                    fontSize: 14,
                    textAlign: "right",
                    color: colors.text.secondary,
                    fontWeight: "normal",
                    flex: 1
                }}>
                    {new Date(recentSession.timestamp).toLocaleDateString('en-US', {
                        year: '2-digit',
                        month: '2-digit',
                        day: '2-digit'
                    })}
                </FontText>
            </View>
            <View style={{flexDirection: "row"}}>
                <View style={{
                    flexDirection: "column",
                    flex: 1,
                    borderRightWidth: 1,
                    borderColor: colors.border.default,
                    paddingBottom: 8,
                    paddingTop: 6,
                    paddingLeft: 12,
                }}>
                    <FontText style={{fontSize: 13, textAlign: "left", fontWeight: 700, color: colors.text.secondary}}>SG</FontText>
                    <FontText style={{
                        fontSize: 20,
                        color: colors.text.primary,
                        fontWeight: "bold",
                    }}>{recentSession.strokesGained}</FontText>
                </View>
                {recentSession.type === "round-simulation" && <View style={{
                    flexDirection: "column",
                    flex: 1,
                    borderRightWidth: 1,
                    borderColor: colors.border.default,
                    paddingBottom: 8,
                    paddingTop: 6,
                    paddingLeft: 12
                }}>
                    <FontText style={{fontSize: 13, fontWeight: 700, textAlign: "left", color: colors.text.secondary}}>DIFFICULTY</FontText>
                    <FontText style={{
                        fontSize: 20,
                        color: colors.text.primary,
                        fontWeight: "bold",
                    }}>{recentSession.difficulty}</FontText>
                </View>}
                <View style={{
                    flexDirection: "column",
                    flex: 1,
                    paddingBottom: 8,
                    paddingTop: 6,
                    paddingLeft: 12
                }}>
                    <FontText style={{fontSize: 13, fontWeight: 700, textAlign: "left", color: colors.text.secondary}}>TOTAL PUTTS</FontText>
                    <FontText style={{
                        fontSize: 20,
                        color: colors.text.primary,
                        fontWeight: "bold",
                    }}>{recentSession.totalPutts}</FontText>
                </View>
            </View>
        </Pressable>
    )
}