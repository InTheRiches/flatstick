import ScreenWrapper from "../../components/general/ScreenWrapper";
import {BackHandler, Text, View} from "react-native";
import React, {useEffect} from "react";
import useColors from "../../hooks/useColors";
import NetInfo from "@react-native-community/netinfo";
import {useNavigation} from "expo-router";

export default function Offline() {
    const colors = useColors();
    const navigation = useNavigation();

    // Monitor authentication state changes
    useEffect(() => {
        const unsubscribeNetInfo = NetInfo.addEventListener(state => {
            if (state.isConnected) {
                navigation.goBack();
            }
        });

        const onBackPress = () => {
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            onBackPress
        );

        return () => {
            unsubscribeNetInfo();
            backHandler.remove();
        }
    }, []);

    return (
        <ScreenWrapper>
            <View style={{
                borderBottomWidth: 1,
                borderBottomColor: colors.border.default,
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 32
            }}>
                <Text style={{color: colors.text.primary, fontSize: 24, fontWeight: 600, textAlign: "center"}}>You are Offline</Text>
                <Text style={{color: colors.text.secondary, fontSize: 18, marginTop: 12, textAlign: "center"}}>Reconnect to wifi to use Flatstick.</Text>
            </View>
        </ScreenWrapper>
    )
}