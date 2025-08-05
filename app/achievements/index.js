import {useAppContext} from "../../contexts/AppContext";
import ScreenWrapper from "../../components/general/ScreenWrapper";
import {getAchievementSVG} from "../../assets/svg/AchievementSvg";
import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import useColors from "../../hooks/useColors";
import achievementData from "../../assets/achievements.json"
import {Path, Svg} from "react-native-svg";

const AchievementList = ({ achievements }) => {
    const colors = useColors();
    const grouped = groupAchievementsByCategory(achievementData);

    console.log(grouped);

    const formatCategoryLabel = str =>
        str.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
        <ScrollView contentContainerStyle={{paddingHorizontal: 24}}>
            {Object.entries(grouped).map(([category, items]) => (
                <View key={category} style={{marginBottom: 24}}>
                    <Text style={{fontSize: 20, fontWeight: "600", marginBottom: 8, color: colors.text.primary}}>{formatCategoryLabel(category)}</Text>
                    <View style={{flexDirection: "row", gap: 24}}>
                        {items.map((ach) => {
                            const achData = achievements.find(a => a.id === ach.id) || {};
                            return (
                                <View key={ach.id} style={{alignItems: "center"}}>
                                    <View style={{backgroundColor: colors.background.secondary, borderWidth: 1, borderColor: achData.earned ? "#ffcc4d" : "transparent", borderRadius: 50, padding: 10, marginBottom: 8}}>
                                        {getAchievementSVG(ach.id, achData.earned)}
                                        {/*<View style={{position: "absolute", top: 0, right: 0}}>*/}
                                        {/*    <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"*/}
                                        {/*         fill={"#ffcc4d"} width={24} height={24}>*/}
                                        {/*        <Path fillRule="evenodd"*/}
                                        {/*              d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.22 49.22 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.343v.256Zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 0 1-2.863 3.207 6.72 6.72 0 0 0 .857-3.294Z"*/}
                                        {/*              clipRule="evenodd"/>*/}
                                        {/*    </Svg>*/}
                                        {/*</View>*/}
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

    // each entry in userData.achievements has a category. Seperate them by category and display a header for each category


    return (
        <ScreenWrapper>
            <AchievementList achievements={userData.achievements} />
        </ScreenWrapper>
    )
}