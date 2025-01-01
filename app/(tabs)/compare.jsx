import {Text, View} from "react-native";
import useColors from "../../hooks/useColors";
import {PrimaryButton} from "../../components/general/buttons/PrimaryButton";
import {useRouter} from "expo-router";
import {useAppContext} from "../../contexts/AppCtx";
import Svg, {G, Path, Polygon} from "react-native-svg";
import React from "react";

export default function Compare({}) {
    const colors = useColors();
    const router = useRouter();
    const {putters} = useAppContext();

    return (
        <View style={{backgroundColor: colors.background.primary, flex: 1, alignItems: "center", paddingHorizontal: 24, justifyContent: "center"}}>
            <Text style={{fontSize: 20, color: colors.text.primary, marginBottom: 24, fontWeight: 600}}>Compare Your Stats</Text>
            <View style={{flexDirection: "row", gap: 16}}>
                <PrimaryButton disabled={putters.length === 0} onPress={() => {
                    if (putters.length === 0) return;
                    router.push({pathname: "/compare/putters"})
                }} style={{borderRadius: 12, paddingVertical: 12, paddingHorizontal: 12, flex: 1, justifyContent: "flex-start"}}>
                    <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={40} height={40}>
                        <G>
                            <Path d="M415.309,397.207l-48.659-14.684c-11.135-3.355-18.738-13.613-18.738-25.231v-52.328l24.402-50.14   l-59.232-29.664l-26.453,54.3c-3.267,6.733-4.98,14.136-4.98,21.634V357.1c0,10.918-8.842,19.776-19.776,19.776H57.324   c-20.549,0-37.195,16.654-37.195,37.194v49.971c0,20.548,13.951,32.27,37.195,37.211C112.533,508.517,210.164,512,236.313,512   c26.156,0,123.788-3.483,178.996-10.748c23.252-4.941,37.195-16.663,37.195-37.211v-29.64   C452.504,413.869,438.473,403.032,415.309,397.207z"/>
                            <Polygon points="491.871,0 437.837,0 331.443,211.983 374.623,233.617  "/>
                        </G>
                    </Svg>
                    <Text
                        style={{color: colors.text.primary, fontSize: 18, fontWeight: 600, marginTop: 6}}>Putters</Text>
                    <Text style={{color: colors.text.secondary, fontSize: 14, textAlign: "center"}}>Compare your putters
                        to determine which one is best for you.</Text>
                </PrimaryButton>
                <PrimaryButton style={{borderRadius: 12, paddingVertical: 12, paddingHorizontal: 12, flex: 1}}
                               onPress={() => router.push({pathname: "/compare/users/search"})}>
                    <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={colors.text.primary} width={40}
                         height={40}>
                        <Path
                            d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z"/>
                    </Svg>
                    <Text style={{color: colors.text.primary, fontSize: 18, fontWeight: 600, marginTop: 6}}>Users</Text>
                    <Text style={{color: colors.text.secondary, fontSize: 14, textAlign: "center"}}>Compare yourself
                        against another user to see who's the better putter.</Text>
                </PrimaryButton>
            </View>
        </View>
    )
}