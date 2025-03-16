import useColors from "../../../../hooks/useColors";
import {Dimensions, ScrollView, View} from "react-native";
import {LeftRightBias, ShortPastBias} from "../../../sessions/individual";
import {useAppContext} from "../../../../contexts/AppCtx";
import FontText from "../../../general/FontText";
import React from "react";
import {roundTo} from "../../../../utils/roundTo";

// TODO - implement this component
export default function MissBiasTab({statsToUse}) {
    const {width} = Dimensions.get("screen");
    const {userData} = useAppContext();
    const colors = useColors();

    return (
        <View>
            <ScrollView contentContainerStyle={{paddingBottom: 0, alignItems: "center"}} showsVerticalScrollIndicator={false} bounces={false} style={{width: width, paddingHorizontal: 20}}>
                <FontText style={{color: colors.text.primary, fontSize: 20, fontWeight: 600, marginBottom: 12, width: "100%"}}>First Putt Bias</FontText>
                <View style={{backgroundColor: colors.background.secondary, borderRadius: 12, flex: 1, flexDirection: 'row', marginBottom: 20}}>
                    <View style={{
                        flexDirection: "column",
                        flex: 1,
                        borderRightWidth: 1,
                        borderColor: colors.border.default,
                        paddingBottom: 6,
                        paddingLeft: 12,
                        paddingTop: 4
                    }}>
                        <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Percent High-side</FontText>
                        <FontText style={{fontSize: 20, color: colors.text.primary, fontWeight: "bold"}}>{statsToUse.percentHigh !== undefined ? roundTo(statsToUse.percentHigh*100, 0) + "%" : "N/A"}</FontText>
                    </View>
                    <View style={{flexDirection: "column", flex: 1, paddingBottom: 6, paddingLeft: 12, paddingTop: 4}}>
                        <FontText style={{fontSize: 14, textAlign: "left", color: colors.text.secondary}}>Percent Short</FontText>
                        <FontText style={{fontSize: 20, color: colors.text.primary, fontWeight: "bold"}}>{statsToUse.percentShort !== undefined ? roundTo(statsToUse.percentShort*100, 0) + "%" : "N/A"}</FontText>
                    </View>
                </View>
                <LeftRightBias bias={statsToUse.leftRightBias} units={userData.preferences.units}/>
                <ShortPastBias bias={statsToUse.shortPastBias} units={userData.preferences.units}/>
            </ScrollView>
        </View>
    )
}