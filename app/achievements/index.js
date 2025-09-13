import {useAppContext} from "../../contexts/AppContext";
import ScreenWrapper from "../../components/general/ScreenWrapper";
import {getAchievementSVG} from "../../assets/svg/AchievementSvg";
import React from "react";
import {Pressable, ScrollView, StyleSheet, Text, View} from "react-native";
import useColors from "../../hooks/useColors";
import achievementData from "../../assets/achievements.json"
import {Path, Svg} from "react-native-svg";
import FontText from "../../components/general/FontText";
import {SecondaryButton} from "../../components/general/buttons/SecondaryButton";
import {useRouter} from "expo-router";

const AchievementList = ({ achievements }) => {
    const colors = useColors();
    const grouped = groupAchievementsByCategory(achievementData);

    const formatCategoryLabel = str =>
        str.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
        <ScrollView>
            {Object.entries(grouped).map(([category, items]) => (
                <View key={category} style={{marginBottom: 24}}>
                    <Text style={{fontSize: 20, fontWeight: "600", marginBottom: 14, color: colors.text.primary}}>{formatCategoryLabel(category)}</Text>
                    <View style={{flexDirection: "row", gap: 24}}>
                        {items.map((ach) => {
                            const achData = achievements.find(a => a.id === ach.id) || {};
                            return (
                                <View key={ach.id} style={{alignItems: "center"}}>
                                    <View style={{backgroundColor: colors.background.secondary, borderWidth: 1, borderColor: achData.earned ? "#ffcc4d" : "transparent", borderRadius: 50, padding: 10, marginBottom: 8}}>
                                        {getAchievementSVG(ach.id, achData.earned)}
                                        { !achData.earned && (
                                            <View style={{
                                                position: "absolute",
                                                top: -10,
                                                right: -10,
                                                aspectRatio: 1,
                                                backgroundColor: "lightgray",
                                                borderRadius: 50,
                                                padding: 6
                                            }}>
                                                <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                                     width={20} height={20} fill={"gray"} style={{top: -1}}>
                                                    <Path fillRule="evenodd"
                                                          d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
                                                          clipRule="evenodd"/>
                                                </Svg>
                                            </View>
                                        )}
                                    </View>

                                    <Text style={styles.achievementText}>
                                        {ach.title}
                                    </Text>
                                </View>
                            )
                        })}
                    </View>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingBottom: 32,
    },
    achievement: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        marginBottom: 6,
    },
    achievementText: {
        fontSize: 16,
    },
});


const groupAchievementsByCategory = (achievements) => {
    return achievements.reduce((acc, ach) => {
        const category = ach.category || "Other";
        if (!acc[category]) acc[category] = [];
        acc[category].push(ach);
        return acc;
    }, {});
};

export default function Achievements({}) {
    const {userData} = useAppContext();
    const colors = useColors();
    const router = useRouter();

    return (
        <ScreenWrapper style={{paddingHorizontal: 24}}>
            <View style={{flexDirection: "row"}}>
                <Pressable onPress={() => router.back()} style={{marginLeft: -10, marginTop: 3, paddingHorizontal: 10}}>
                    <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5}
                         stroke={colors.text.primary} width={24} height={24}>
                        <Path strokeLinecap="round" strokeLinejoin="round"
                              d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"/>
                    </Svg>
                </Pressable>
                <View style={{flexDirection: "col", alignItems: "flex-start", flex: 0, paddingBottom: 10,}}>
                    <FontText style={{
                        fontSize: 24,
                        fontWeight: 600,
                        color: colors.text.primary
                    }}>Achievements</FontText>
                </View>
            </View>
            <AchievementList achievements={userData.achievements} />
            <View style={{position: "absolute", bottom: 0, width: "100%", flexDirection: "row", marginLeft: 24, alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 20}}>
                <SecondaryButton onPress={() => router.back()} title={"Back"}
                                 style={{paddingVertical: 10, borderRadius: 10, flex: 0.8}}></SecondaryButton>
            </View>
        </ScreenWrapper>
    )
}