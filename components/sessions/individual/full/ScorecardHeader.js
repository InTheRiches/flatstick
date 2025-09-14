import {View} from "react-native";
import FontText from "../../../general/FontText";
import React from "react";
import useColors from "../../../../hooks/useColors";

export default function ScorecardHeader({session}) {
    const colors = useColors();

    return (
        <View style={{backgroundColor: colors.background.secondary, borderWidth: 1, borderBottomWidth: 0, borderColor: colors.border.default, borderTopLeftRadius: 16, borderTopRightRadius: 16, marginTop: 16}}>
            <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.border.default }}>
                <View style={{flexDirection: "column", flex: 1, borderRightWidth: 1, borderColor: colors.border.default, paddingBottom: 8, paddingTop: 6, paddingLeft: 12,}}>
                    <FontText style={{fontSize: 13, textAlign: "left", fontWeight: 700, color: colors.text.tertiary,}}>COURSE</FontText>
                    <FontText style={{fontSize: 20, color: colors.text.primary, fontWeight: "bold", flexShrink: 1}}>{session.meta.courseName ?? "Practice Putting Green"}</FontText>
                </View>
                <View style={{flexDirection: "column", flex: 0.5, paddingBottom: 8, paddingTop: 6, paddingLeft: 12,}}>
                    <FontText style={{fontSize: 13, textAlign: "left", fontWeight: 700, color: colors.text.tertiary,}}>TEE</FontText>
                    <FontText style={{fontSize: 20, color: colors.text.primary, fontWeight: "bold", flexShrink: 1}}>{session.meta.tee.name[0] + session.meta.tee.name.toLowerCase().slice(1)}</FontText>
                </View>
            </View>
        </View>
    )
}