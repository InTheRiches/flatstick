import {Image, Text, View} from "react-native";
import {useLocalSearchParams, useNavigation} from "expo-router";
import useColors from "@/hooks/useColors";
import {PrimaryButton} from "@/components/general/buttons/PrimaryButton";
import {RecapVisual} from "../../../../components/simulations/recap";

export default function SimulationRecap() {
    const {current, holes, madePercent, totalPutts, difficulty, mode, missData, avgMiss, date} = useLocalSearchParams();

    const parsedDate = new Date(date);
    const parsedMissData = JSON.parse(missData);

    const colors = useColors();
    const navigation = useNavigation();

    return (
        <View style={{backgroundColor: colors.background.primary, flex: 1, alignItems: "center", flexDirection: "column", justifyContent: "space-between"}}>
            <View style={{width: "100%"}}>
                <View style={{
                    borderColor: colors.border.default,
                    justifyContent: "center",
                    alignContent: "center",
                    width: "100%",
                    borderBottomWidth: 1,
                    paddingTop: 6,
                    paddingBottom: 10,
                }}>
                    <Text style={{
                        textAlign: "center",
                        fontSize: 16,
                        fontWeight: "medium",
                        color: colors.text.primary
                    }}>Session Recap</Text>
                    <Image source={require('@/assets/images/PuttLabLogo.png')}
                           style={{position: "absolute", left: 12, top: -2, width: 35, height: 35}}/>
                </View>
                <View style={{paddingHorizontal: 24, width: "100%", paddingTop: 32}}>
                    <Text style={{textAlign: "center", color: colors.text.primary, fontSize: 18, fontWeight: 600}}>Good Job!</Text>
                    <Text style={{textAlign: "center", color: colors.text.primary, marginBottom: 24}}>This {current === "true" ? "is" : "was"} your nth session.</Text>
                    <RecapVisual makePercent={madePercent} holes={holes} totalPutts={totalPutts} avgDistance={avgMiss}
                                 makeData={parsedMissData}
                                 date={parsedDate}></RecapVisual>
                </View>
            </View>
            <View style={{width: "100%", paddingBottom: 24, paddingHorizontal: 32}}>
                <PrimaryButton onPress={() => current !== "true" ? navigation.goBack() : navigation.navigate("(tabs)")}
                               title={current === "true" ? "Continue" : "Back"}
                               style={{paddingVertical: 10, borderRadius: 10}}></PrimaryButton>
            </View>
        </View>
    )
}