// only 18 hole simulations and real simulations, no other practices
import {View} from "react-native";
import useColors from "../../../../hooks/useColors";
import {convertUnits} from "../../../../utils/Conversions";
import {useAppContext} from "../../../../contexts/AppCtx";
import FontText from "../../../general/FontText";

export const RecentSession = ({recentSession}) => {
    const colors = useColors();
    const {userData} = useAppContext();

    const formattedName = () => {
        if (recentSession.type === "real-simulation") {
            return recentSession.holes + " Hole Round";
        } else if (recentSession.type === "round-simulation") {
            return recentSession.holes + " Hole Simulation";
        }
        return "huggidy buggidy"
    }

    return (
        <View style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingTop: 8}}>
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
                    paddingBottom: 12,
                    paddingTop: 6,
                    paddingLeft: 12,
                }}>
                    <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Strokes Gained</FontText>
                    <FontText style={{
                        fontSize: 20,
                        color: colors.text.primary,
                        fontWeight: "bold",
                    }}>{recentSession.strokesGained}</FontText>
                </View>
                <View style={{
                    flexDirection: "column",
                    flex: 1,
                    borderRightWidth: 1,
                    borderColor: colors.border.default,
                    paddingBottom: 12,
                    paddingTop: 6,
                    paddingLeft: 12
                }}>
                    <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>{recentSession.type === "round-simulation" ? "Difficulty" : "Total Distance"}</FontText>
                    <FontText style={{
                        fontSize: 20,
                        color: colors.text.primary,
                        fontWeight: "bold",
                    }}>{recentSession.type === "round-simulation" ? recentSession.difficulty : convertUnits(recentSession.totalDistance, recentSession.units, userData.preferences.units)}</FontText>
                </View>
                <View style={{
                    flexDirection: "column",
                    flex: 1,
                    paddingBottom: 12,
                    paddingTop: 6,
                    paddingLeft: 12
                }}>
                    <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Total Putts</FontText>
                    <FontText style={{
                        fontSize: 20,
                        color: colors.text.primary,
                        fontWeight: "bold",
                    }}>{recentSession.totalPutts}</FontText>
                </View>
            </View>
        </View>
    )
}