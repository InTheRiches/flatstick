import {Pressable, ScrollView, View} from "react-native";
import Svg, {Path} from "react-native-svg";
import FontText from "../../../components/general/FontText";
import React, {useEffect, useRef} from "react";
import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import ScreenWrapper from "../../../components/general/ScreenWrapper";
import useColors from "../../../hooks/useColors";
import {useLocalSearchParams, useNavigation, useRouter} from "expo-router";
import {SecondaryButton} from "../../../components/general/buttons/SecondaryButton";
import {getFriends} from "../../../utils/friends/friendServices";

export default function UserFriends({}) {
    const colors = useColors();
    const navigation = useNavigation();
    const {data} = useLocalSearchParams();
    console.log("data: ", data)
    const userData = JSON.parse(data);

    const router = useRouter();
    const [loading, setLoading] = React.useState(true);
    const [friends, setFriends] = React.useState([]);

    useEffect(() => {
        getFriends(userData.uid).then(setFriends).then(() => setLoading(false));
    }, []);

    return (
        <BottomSheetModalProvider>
            <ScreenWrapper style={{borderBottomWidth: 1, borderBottomColor: colors.border.default, paddingHorizontal: 24}}>
                <ScrollView keyboardShouldPersistTaps={'handled'}>
                    <View style={{flexDirection: "row"}}>
                        <Pressable onPress={() => navigation.goBack()} style={{marginLeft: -10, marginTop: 7, paddingHorizontal: 10}}>
                            <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5}
                                 stroke={colors.text.primary} width={24} height={24}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"/>
                            </Svg>
                        </Pressable>
                        <View style={{flexDirection: "row", flex: 1, alignItems: "center", justifyContent: "space-between", paddingBottom: 10,}}>
                            <FontText style={{
                                fontSize: 20,
                                fontWeight: 600,
                                color: colors.text.primary,
                                flex: 1,
                            }}>{userData.displayName}'s Friends</FontText>
                            <Pressable onPress={() => router.push("friends/search")} style={({pressed}) => [{backgroundColor: pressed ? colors.button.secondary.depressed : colors.button.secondary.background, padding: 8, alignItems: "center", justifyContent: "center", aspectRatio: 1, borderRadius: 50}]}>
                                <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={colors.button.secondary.text} width={24} height={24}>
                                    <Path
                                        d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z"/>
                                </Svg>
                            </Pressable>
                        </View>
                    </View>
                    <View style={{marginBottom: 20, marginTop: 6}}>
                        <FontText style={{color: colors.button.primary.text, fontWeight: 800, fontSize: 16, marginBottom: 14, width: "100%", borderBottomWidth: 1, borderColor: colors.border.default, paddingBottom: 8}}>{friends.length} FRIEND{friends.length === 1 ? "" : "S"}</FontText>
                        { !loading && friends.length < 1 && (
                            <View style={{backgroundColor: colors.background.secondary, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 12, borderWidth: 1, borderColor: colors.border.default}}>
                                <FontText style={{width: "100%", textAlign: "center", color: colors.text.secondary, marginBottom: 16}}>Looking for your friends? Search for them, or invite them to Flatstick!</FontText>
                                <SecondaryButton title={"Add Friends"} onPress={() => router.push("friends/search")}/>
                            </View>
                        )}
                        { friends.length > 0 && friends.map((friend, index) => {
                            const date = new Date(friend.date);
                            return (
                                <Pressable key={"user-" + index} style={({pressed}) => [{
                                    padding: 8,
                                    backgroundColor: pressed ? colors.button.primary.depressed : colors.background.secondary,
                                    borderWidth: 1,
                                    borderColor: colors.border.default,
                                    borderRadius: 14,
                                    marginBottom: 8,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 12
                                }]} onPress={() => {
                                    router.push({pathname: "/user", params: {userDataString: JSON.stringify(friend)}})
                                }}>
                                    <View style={{flexDirection: "row", flex: 1}}>
                                        <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={colors.text.secondary} width={48} height={48}>
                                            <Path fillRule="evenodd"
                                                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                                                  clipRule="evenodd"/>
                                        </Svg>
                                        <View style={{marginLeft: 6, flex: 1}}>
                                            <FontText style={{color: colors.text.primary, fontSize: 16, fontWeight: 500}}>{friend.displayName}</FontText>
                                            <View style={{flexDirection: "row", alignItems: "center", marginTop: 4, justifyContent: "space-between"}}>
                                                <FontText style={{color: colors.text.secondary, fontSize: 14}}>SG: {friend.strokesGained}</FontText>
                                                <FontText style={{color: colors.text.secondary, fontSize: 14}}>Joined: {(date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear()}</FontText>
                                            </View>
                                        </View>
                                    </View>
                                </Pressable>
                            )
                        })}
                    </View>
                </ScrollView>
            </ScreenWrapper>
        </BottomSheetModalProvider>
    )
}