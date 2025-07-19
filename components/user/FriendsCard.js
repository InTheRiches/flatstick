import React from 'react';
import { View, Pressable } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import FontText from '../../components/general/FontText';
import useColors from '../../hooks/useColors';
import { useRouter } from 'expo-router';

export default function FriendsCard({ pending, userScreenRef, friendCount, isFriend, isSelf }) {
    const colors = useColors();
    const router = useRouter();

    return (
        <View style={{ flexDirection: 'row', flex: 1, backgroundColor: colors.button.primary.background, borderRadius: 12, borderWidth: 1, borderColor: colors.border.default }}>
            {!isSelf && (
                <Pressable style={({pressed}) => ({
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 12,
                    borderRightWidth: 1,
                    borderRightColor: colors.button.primary.border,
                    borderTopLeftRadius: 12,
                    borderBottomLeftRadius: 12,
                    backgroundColor: pressed ? colors.button.primary.depressed : colors.button.primary.background,
                })} onPress={() => {
                    if (isFriend) userScreenRef.current?.removeFriend();
                    else if (pending === "sent") userScreenRef.current?.removeRequest();
                    else if (pending === "received") userScreenRef.current?.acceptRequest();
                    else userScreenRef.current?.addFriend();
                }}>
                    {isFriend ? (
                        <Svg xmlns="http://www.w3.org/2000/svg" fill={colors.text.primary} viewBox="0 0 24 24" strokeWidth={1.5}
                             stroke={colors.text.primary} width={32} height={32}>
                            <Path strokeLinecap="round" strokeLinejoin="round"
                                  d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z"/>
                        </Svg>
                    ) : pending === "sent" ? (
                        <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                             strokeWidth={3} stroke={colors.text.primary} width={24}
                             height={24} style={{marginHorizontal: 4}}>
                            <Path strokeLinecap="round" strokeLinejoin="round"
                                  d="M6 18 18 6M6 6l12 12"/>
                        </Svg>
                    ) : pending === "received" ? (
                        <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                             strokeWidth={3} stroke={colors.text.primary} width={24} height={24}
                             style={{marginHorizontal: 4}}>
                            <Path strokeLinecap="round" strokeLinejoin="round"
                                  d="m4.5 12.75 6 6 9-13.5"/>
                        </Svg>
                    ) : (
                        <Svg viewBox="0 0 24 24" stroke={colors.text.primary} width={32} height={32}>
                            <Path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"/>
                        </Svg>
                    )}
                </Pressable>
            )}
            <Pressable
                style={({pressed}) => ({
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: 12,
                    borderTopRightRadius: 12,
                    borderBottomRightRadius: 12,
                    borderTopLeftRadius: isSelf ? 12 : 0,
                    borderBottomLeftRadius: isSelf ? 12 : 0,
                    backgroundColor: pressed ? colors.button.primary.depressed : colors.button.primary.background,
                })}
                onPress={() => isSelf ? router.push('/friends') : router.push({
                    pathname: '/friends/user',
                    params: {data: JSON.stringify(userScreenRef.current?.friendData)}
                    })}
            >
                <View>
                    <FontText style={{ fontWeight: 700, fontSize: 20, color: colors.button.primary.text }}>{friendCount}</FontText>
                    <FontText style={{ fontWeight: 700, fontSize: 14, color: colors.text.tertiary }}>FRIEND{friendCount === 1 ? "" : "S"}</FontText>
                </View>
                <Svg key={"2"} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} width={24} height={24} stroke={colors.button.primary.text}>
                    <Path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/>
                </Svg>
            </Pressable>
        </View>
    );
}
