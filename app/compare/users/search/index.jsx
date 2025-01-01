import {Pressable, ScrollView, Text, TextInput, View} from "react-native";
import React, {useState} from "react";
import useColors from "../../../../hooks/useColors";
import {auth, getProfilesByUsername} from "../../../../utils/firebase";
import Svg, {Path} from "react-native-svg";
import {useNavigation, useRouter} from "expo-router";

export default function SearchUsers({}) {
    const colors = useColors();

    const [profiles, setProfiles] = useState([]);
    const [username, setUsername] = useState("");
    const router = useRouter();
    const navigation = useNavigation();

    const updateUsername = (text) => {
        // search for profiles that match that name
        setUsername(text);
        if (text.length > 2) {
            getProfilesByUsername(text).then(fetchedProfiles => {
                // remove the current user from the list
                const currentUser = auth.currentUser;
                const filteredProfiles = fetchedProfiles.filter(profile => profile.id !== currentUser.uid);
                setProfiles(filteredProfiles);
            });
        } else {
            setProfiles([]);
        }
    };

    return (
        <View style={{paddingBottom: 25, paddingHorizontal: 24, gap: 12, flex: 1, width: "100%", backgroundColor: colors.background.primary}}>
            <View style={{flexDirection: "row", alignItems: "center", gap: 12}}>
                <Pressable onPress={() => {
                    navigation.goBack()
                }} style={{padding: 4, paddingLeft: 0}}>
                    <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3}
                         stroke={colors.text.primary} width={24} height={24}>
                        <Path strokeLinecap="round" strokeLinejoin="round"
                              d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"/>
                    </Svg>
                </Pressable>
                <Text style={{fontSize: 24, fontWeight: 500, color: colors.text.primary}}>Find Users</Text>
            </View>
            <TextInput
                placeholder={"Username"}
                style={{
                    backgroundColor: colors.input.background,
                    color: colors.input.text,
                    borderWidth: 1,
                    borderColor: colors.input.border,
                    borderRadius: 12,
                    padding: 12,
                    fontSize: 16,
                }}
                placeholderTextColor={colors.text.secondary}
                onChangeText={updateUsername}
            />
            {profiles.length === 0 && <Text style={{color: colors.text.secondary, textAlign: "center", fontSize: 18, fontWeight: 500}}>No users found</Text>}
            <ScrollView keyboardShouldPersistTaps={true} bounces={false} contentContainerStyle={{paddingBottom: 64}}>
                {profiles.length > 0 && profiles.map((profile, index) => {
                    console.log(profile.id)
                    return (
                        <Pressable key={"user-" + index} style={({pressed}) => [{
                            padding: 8,
                            backgroundColor: pressed ? colors.button.primary.depressed : colors.background.secondary,
                            borderRadius: 14,
                            marginBottom: 8,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between"
                        }]} onPress={() => router.push({pathname: "/compare/users", params: {id: profile.id, jsonProfile: JSON.stringify(profile)}})}>
                            <View style={{flexDirection: "row",}}>
                                <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={colors.text.secondary} width={48} height={48}>
                                    <Path fillRule="evenodd"
                                          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                                          clipRule="evenodd"/>
                                </Svg>
                                <View style={{marginLeft: 6}}>
                                    <Text style={{color: colors.text.primary, fontSize: 16, fontWeight: 500}}>{profile.username}</Text>
                                    <Text style={{color: colors.text.secondary, fontSize: 14}}>SG: {profile.strokesGained}</Text>
                                </View>
                            </View>
                            <View style={{backgroundColor: colors.button.secondary.background, alignItems: "center", justifyContent: "center", aspectRatio: 1, borderRadius: 24, paddingHorizontal: 8}}>
                                <Svg width={20} height={20} xmlns="http://www.w3.org/2000/svg" fill="none"
                                     viewBox="0 0 24 24" strokeWidth={2}
                                     stroke={colors.button.secondary.text} className="size-6">
                                    <Path strokeLinecap="round" strokeLinejoin="round"
                                          d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/>
                                </Svg>
                            </View>
                        </Pressable>
                    )
                })}
            </ScrollView>
        </View>
    )
}